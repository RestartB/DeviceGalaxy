<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Fuse from 'fuse.js';

  import type { InferSelectModel } from 'drizzle-orm';
  import type { tags } from '$lib/server/db/schema';

  import CreateTagForm from '$lib/components/add_tag/Form.svelte';
  import EditTagForm from '$lib/components/edit_tag/Form.svelte';
  import { Plus, RefreshCw, X, Eye, Pencil, Trash } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';

  const { data } = $props();

  let tagList: InferSelectModel<typeof tags>[] = $state([]);
  let searchedTags: InferSelectModel<typeof tags>[] = $state([]);
  let loadingTags = $state(false);
  let errorLoadingTags = $state(false);

  let search = $state('');

  let createPopupOpen = $state(false);
  let editPopupOpen = $state(false);
  let deletePopupOpen = $state(false);

  let toDelete: InferSelectModel<typeof tags> | undefined = $state();
  let toEdit: InferSelectModel<typeof tags> | undefined = $state();

  let pageInitialized = $state(false);

  async function getTags() {
    if (loadingTags) return;
    if (errorLoadingTags) return;

    loadingTags = true;
    try {
      const response = await fetch('/api/tags/get_tags');
      const data = await response.json();

      tagList = data.tags as InferSelectModel<typeof tags>[];
      searchTags();
    } catch (error) {
      console.error('Error fetching tags:', error);
      errorLoadingTags = true;
    } finally {
      loadingTags = false;
    }
  }

  function searchTags() {
    if (search.trim() === '') {
      searchedTags = tagList;
      return;
    }

    const fuse = new Fuse(tagList, {
      keys: ['tagName'],
      includeScore: true,
      threshold: 0.3
    });

    const results = fuse.search(search.trim());
    searchedTags = results.map((result) => result.item);
  }

  function deleteTag(tag: InferSelectModel<typeof tags>) {
    if (!tag || !tag.id) return;

    fetch(`/api/tags/delete_tag?id=${tag.id}`, {
      method: 'DELETE'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete tag');
        } else {
          toast.success('Tag deleted successfully!');
        }
        return response.json();
      })
      .then(() => {
        getTags();
        deletePopupOpen = false;
      })
      .catch((error) => {
        toast.error('Failed to delete tag. Please try again later.');
        console.error('Error deleting tag:', error);
      });
  }

  $effect(() => {
    searchTags();
  });

  onMount(() => {
    pageInitialized = true;
    getTags();
  });
</script>

<svelte:head>
  <title>DeviceGalaxy- Tags</title>
</svelte:head>

<CreateTagForm sourceForm={data.newTagForm} bind:createPopupOpen refreshAll={getTags} />
<EditTagForm sourceForm={data.editTagForm} bind:editPopupOpen tag={toEdit} refreshAll={getTags} />

{#if deletePopupOpen && toDelete}
  <div
    class="fixed inset-0 z-30 flex items-center justify-center bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-40"
      onclick={() => (createPopupOpen = false)}
      aria-hidden="true"
    ></div>
    <div
      class="z-50 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Delete Tag</h2>
        <button
          onclick={() => (deletePopupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>

      <div class="flex flex-col items-center justify-center gap-4 p-6">
        <div
          class="flex h-fit w-fit items-center justify-center gap-2 rounded-lg border-2 border-zinc-500 bg-zinc-200 px-4 py-2"
          style="background-color: {toDelete.tagColour}; color: {toDelete.tagTextColour};"
        >
          <p>{toDelete.tagName}</p>
        </div>
        <p>Are you sure you want to delete this tag? This action cannot be undone.</p>
      </div>

      <div class="border-t p-6">
        <button
          type="submit"
          class="w-full cursor-pointer rounded-md bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600 disabled:hover:bg-red-500"
          onclick={() => {
            if (!toDelete) return;
            deleteTag(toDelete);
          }}>Delete Tag</button
        >
      </div>
    </div>
  </div>
{/if}

<div class="flex flex-col gap-2">
  <h1 class="text-4xl font-bold">Tags</h1>
  <p>Manage your tags here. Tags are used to categorize devices.</p>

  <div class="flex flex-wrap gap-2">
    <button
      class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-400 bg-blue-500 text-white"
      onclick={() => (createPopupOpen = true)}
    >
      <Plus size="20" />
    </button>
    <button
      class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-400 bg-zinc-100 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-600"
      onclick={getTags}
    >
      <RefreshCw size="20" />
    </button>
    <input
      type="text"
      id="search"
      name="search"
      class="flex items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 dark:bg-zinc-800"
      placeholder="Search tags..."
      bind:value={search}
    />
  </div>

  {#if loadingTags || !pageInitialized}
    <p>Loading tags...</p>
  {:else if errorLoadingTags}
    <p class="text-red-500">Error loading tags. Please try again later.</p>
  {:else if tagList.length === 0}
    <p>No tags available. When you create a new tag, it will show here.</p>
  {:else if searchedTags.length === 0}
    <p>No tags found matching your search.</p>
  {:else}
    <ul class="flex list-none flex-wrap justify-center gap-2 sm:justify-start">
      {#each searchedTags as tag (tag.id)}
        <li class="h-fit w-fit">
          <div
            class="flex h-fit w-fit items-center justify-center gap-2 rounded-lg border-2 border-zinc-500 bg-zinc-200 px-4 py-2 dark:bg-zinc-700"
            style="background-color: {tag.tagColour}; color: {tag.tagTextColour};"
          >
            <p>{tag.tagName}</p>
            <a href="/dash/devices?tags={tag.id}" class="cursor-pointer">
              <Eye size="20" />
            </a>
            <button
              class="cursor-pointer"
              title="Edit Tag"
              onclick={() => {
                toEdit = tag;
                editPopupOpen = true;
              }}
            >
              <Pencil size="20" />
            </button>
            <button
              class="cursor-pointer"
              title="Delete Tag"
              onclick={() => {
                toDelete = tag;
                deletePopupOpen = true;
              }}
            >
              <Trash size="20" />
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
