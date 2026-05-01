<svelte:head>
  <title>DeviceGalaxy - Privacy Policy</title>
</svelte:head>

<div class="flex w-full items-center justify-center">
  <div class="flex max-w-5xl flex-col gap-5">
    <div>
      <h1 class="text-4xl font-bold">Privacy Policy</h1>
      <h2 class="text-xl font-semibold">Updated: 30/04/2026</h2>
    </div>

    <p>
      This document explains how DeviceGalaxy treats your data. This document is an agreement
      between you (the user) and DeviceGalaxy (Restart). <strong
        >Please note that this Privacy Policy only applies to the main instance. For other
        instances, please refer to their respective policies.</strong
      >
    </p>

    <section class="flex flex-col gap-2.5" id="data">
      <h2 class="text-xl font-semibold">Host Country</h2>
      <p>
        DeviceGalaxy is hosted on Hetzner servers in Helsinki, Finland. By using DeviceGalaxy, you
        agree to EU law, UK law, as well as the guidelines of your own country, and the ones in the
        terms of use document.
      </p>
    </section>

    <section class="flex flex-col gap-2.5" id="data">
      <h2 class="text-xl font-semibold">Basic Data</h2>
      <p>
        When you visit DeviceGalaxy, I may collect basic information like IP addresses and some
        information about your device. This is required for the website to function.
      </p>
    </section>

    <section class="flex flex-col gap-2.5" id="database">
      <h2 class="text-xl font-semibold">Database and Password Security</h2>
      <p>
        The database that DeviceGalaxy uses to store data is stored securely and is only accessible
        by me. Passwords are hashed and salted to ensure that in the unlikely case of an
        unauthorised party accessing the database, they will not be able to retrieve the original
        passwords.
      </p>
    </section>

    <section class="flex flex-col gap-2.5" id="devices">
      <h2 class="text-xl font-semibold">Device Security</h2>
      <p>
        When you add a device to DeviceGalaxy, the device can only be accessed by you unless you
        create a share link. When you create a share link, users will be able to access the device
        (or all of your devices if you generated an account share link) using the generated link.
        When the device is shared, all metadata about the device will be public, but the public will
        not be able to edit the device.
      </p>
    </section>

    <section class="flex flex-col gap-2.5" id="images">
      <h2 class="text-xl font-semibold">Image Security</h2>
      <p>
        When you upload an image to a device on DeviceGalaxy, you will be the only one that can
        access it, unless you share the device or your account. DeviceGalaxy will also strip all
        EXIF data from all uploaded images automatically, including location information, to ensure
        that you stay private. This protection can not be disabled. <strong
          >Please note that profile pictures are public and can be accessed by anyone, including
          users without an account.</strong
        >
      </p>
    </section>

    <section class="flex flex-col gap-2.5" id="rights">
      <h2 class="text-xl font-semibold">Your Rights</h2>
      <p>
        As a user of DeviceGalaxy, you have access to several rights about your data. To exercise
        these rights, please contact me using the information at the bottom of this document. These
        rights are:
      </p>
      <ul class="list-inside list-disc">
        <li>Requesting access to your data</li>
        <li>Requesting deletion of your data</li>
        <li>Opting out of data collection</li>
      </ul>
    </section>

    <section class="flex flex-col gap-2.5" id="csam-scanning">
      <h2 class="text-xl font-semibold">Cloudflare CSAM Scanning</h2>
      <p>
        DeviceGalaxy uses the Cloudflare CSAM (Child Sexual Abuse Material) automatic scanning tool,
        to flag illegal CSAM content that may be uploaded to DeviceGalaxy. For more information,
        please go to the official <a
          href="https://developers.cloudflare.com/cache/reference/csam-scanning/"
          >Cloudflare documentation page.</a
        >
      </p>
    </section>

    <section class="flex flex-col gap-2.5" id="backups">
      <h2 class="text-xl font-semibold">Backups</h2>
      <p>
        To ensure that data can be restored in the case of data loss, we make use of the Duplicati
        backup tool. This creates encrypted backups using the AES-256 algorithm that are stored in a
        private Backblaze B2 storage bucket.
      </p>
      <p>
        Since we implemented this backup policy on 30/04/2026, our backup history will build up over
        time. Older backups are automatically deleted, but we will always retain at least one
        backup. Once enough time has passed, our maximum retention schedule will be:
      </p>
      <ul class="list-inside list-disc">
        <li>One backup for each of the last 7 days</li>
        <li>One backup for each of the last 4 weeks</li>
        <li>One backup for each of the last 12 months</li>
      </ul>
    </section>

    <section class="flex flex-col gap-2.5" id="analytics">
      <h2 class="text-xl font-semibold">Cloudflare Analytics</h2>
      <p>
        DeviceGalaxy uses Cloudflare Analytics, a privacy first and lightweight analytics solution,
        to get insights on how the service is used. Some of the following data may be collected:
      </p>
      <ul class="list-inside list-disc">
        <li>country</li>
        <li>host operating system</li>
        <li>referrer</li>
        <li>website status code</li>
        <li>page visited</li>
      </ul>

      <p>
        More data may be collected by Cloudflare. For more information, please go to the official <a
          href="https://www.cloudflare.com/en-gb/web-analytics/">Cloudflare Analytics page.</a
        >
      </p>
    </section>

    <section class="flex flex-col gap-2.5" id="font">
      <h2 class="text-xl font-semibold">Font</h2>
      <p>
        Please note that DeviceGalaxy uses the <a href="https://fonts.google.com/specimen/Figtree"
          >Figtree</a
        > font. Cloudflare Fonts is used for this, which uses Cloudflare to serve the fonts instead of
        Google. This helps to improve performance and privacy.
      </p>
    </section>

    <div class="flex flex-col gap-2.5" id="policy-updates">
      <h2 class="text-xl font-semibold">Policy Updates</h2>
      <p>
        I may make changes to this policy over time. If a major change is made to the privacy
        policy, I will make an announcement over public channels.
      </p>
    </div>

    <div class="flex flex-col gap-2.5" id="contact">
      <h2 class="text-xl font-semibold">Contact</h2>
      <p>
        If you wish to contact me regarding this policy, please join the <a
          href="/server"
          target="_blank">support Discord server</a
        >, then create a ticket. I will attempt to get back to you ASAP regarding your concern.
      </p>
    </div>
  </div>
</div>

<style>
  a {
    text-decoration: underline;
  }
</style>
