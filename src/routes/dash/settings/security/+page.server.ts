import { auth } from '$lib/server/auth';
import { UAParser } from 'ua-parser-js';

import type { PageServerLoad } from './$types';

import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async (event) => {
  const { session, user } = await event.parent();

  if (!session || !user) {
    return {
      activeSessions: []
    };
  }

  // Get sessions
  const sessions = await auth.api.listSessions({
    query: {
      userId: user.id
    },
    headers: event.request.headers
  });

  // Get unique IP addresses from sessions
  const uniqueIPs = new Set(sessions.map((session) => session.ipAddress));

  // Contact IPInfo API
  const ipInfoResponses = await Promise.all(
    Array.from(uniqueIPs).map(async (ip) => {
      try {
        if (ip) {
          const response = await fetch(
            `https://api.ipinfo.io/lite/${ip}?token=${env.IPINFO_TOKEN}`
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch IP info for ${ip}`);
          }
          return response.json();
        }
      } catch (error) {
        console.error(`Error fetching IP info for ${ip}:`, error);
        return;
      }
    })
  );

  // Map IP addresses to their info
  const ipInfoMap = new Map();
  ipInfoResponses.forEach((info) => {
    if (info && info.ip) {
      ipInfoMap.set(info.ip, {
        country: info.country || 'Unknown'
      });
    }
  });

  return {
    thisSession: {
      id: session.id,
      token: session.token,
      ipAddress: session.ipAddress,
      userAgent: (() => {
        if (!session.userAgent) {
          return 'Unknown';
        }

        const parser = new UAParser(session.userAgent);
        const browser = parser.getBrowser();
        const os = parser.getOS();
        return `${browser.name || 'Unknown'} on ${os.name || 'Unknown'}`;
      })(),
      deviceType: (() => {
        if (!session.userAgent) {
          return 'Unknown';
        }

        const parser = new UAParser(session.userAgent);
        const device = parser.getDevice();
        return device.type || 'Unknown';
      })(),
      createdAt: session.createdAt,
      ipCountry: ipInfoMap.get(session.ipAddress)?.country || 'Unknown',
      currentSession: true
    },
    activeSessions: sessions
      .map((session) => ({
        id: session.id,
        token: session.token,
        ipAddress: session.ipAddress,
        userAgent: (() => {
          if (!session.userAgent) {
            return 'Unknown';
          }

          const parser = new UAParser(session.userAgent);
          const browser = parser.getBrowser();
          const os = parser.getOS();
          return `${browser.name || 'Unknown'} on ${os.name || 'Unknown'}`;
        })(),
        deviceType: (() => {
          if (!session.userAgent) {
            return 'Unknown';
          }

          const parser = new UAParser(session.userAgent);
          const device = parser.getDevice();
          return device.type || 'Unknown';
        })(),
        createdAt: session.createdAt,
        ipCountry: ipInfoMap.get(session.ipAddress)?.country || 'Unknown',
        currentSession: false
      }))
      .filter((s) => s.id !== session.id)
  };
};
