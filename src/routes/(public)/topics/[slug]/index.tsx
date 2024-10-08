import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$, server$ } from "@builder.io/qwik-city";
import { fetchBackend } from "~/lib/fetch-backend";
import type { ApiResponse, Group, Topic } from "~/lib/types";
import { Counts } from "./counts";

import { Button } from "~/components/ui/button/button";
import { Badge } from "~/components/ui/badge/badge";
import { NearbyGroups } from "./near-by-groups";
import { LargestGroups } from "./largest-groups";
import { NewestGroups } from "./newest-groups";

export const useFetchTopicDetails = routeLoader$(async ({ params }) => {
  const resp = await fetchBackend()
    .get(`/topics/${params.slug}`)
    .json<ApiResponse<{ topic: Topic }>>();
  return resp.data?.topic;
});

export const useFetchRelatedTopics = routeLoader$(async ({ params }) => {
  const resp = await fetchBackend()
    .get(`/topics/${params.slug}/related-topics`)
    .json<ApiResponse<{ topics: Pick<Topic, "id" | "slug" | "name">[] }>>();
  return resp.data?.topics;
});

export const fetchNearbyGroups = server$(async function (
  lat?: number,
  lon?: number,
) {
  if (lat === undefined || lon === undefined) return [];
  const resp = await fetchBackend()
    .get(`/topics/${this.params.slug}/near-by?lat=${lat}&lon=${lon}`)
    .json<ApiResponse<{ groups: Group[] }>>();
  return resp.data?.groups ?? [];
});
export const useFetchLargestGroups = routeLoader$(async ({ params }) => {
  const resp = await fetchBackend()
    .get(`/topics/${params.slug}/largest-groups`)
    .json<ApiResponse<{ groups: Group[] }>>();
  return resp.data?.groups;
});

export const useFetchNewestGroups = routeLoader$(async ({ params }) => {
  const resp = await fetchBackend()
    .get(`/topics/${params.slug}/newest-groups`)
    .json<ApiResponse<{ groups: Group[] }>>();
  return resp.data?.groups ?? [];
});

export default component$(() => {
  const topicSig = useFetchTopicDetails();
  const relatedTopics = useFetchRelatedTopics();
  return (
    <div class="mx-auto w-full max-w-3xl">
      <div class="grid grid-cols-1 items-center gap-6">
        <div class="grid grid-cols-1 items-center gap-4">
          <h2 class="text-center text-3xl font-bold opacity-70">
            {topicSig.value?.name}
          </h2>
          <p class="sm:text-center">
            Meet other local people interested in {topicSig.value?.name}: share
            experiences, inspire and encourage each other! Join a{" "}
            {topicSig.value?.name} group.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-6  md:grid-cols-3">
          <Counts
            label="Members"
            count={topicSig.value?._count.followedByUsers ?? 0}
          />
          <Counts label="Groups" count={topicSig.value?._count.groups ?? 0} />
          <Counts label="Events" count={topicSig.value?._count.events ?? 0} />
        </div>
        <div>
          <Button size={"sm"}>Join {topicSig.value?.name} groups</Button>
        </div>
        <div>
          <div class="font-medium">Related Topics</div>
          <div class="mt-3 flex flex-wrap gap-4">
            {relatedTopics.value?.map((topic) => (
              <Link key={topic.id} href={`/topics/${topic.slug}`}>
                <Badge class="px-4 py-2" look={"outline"}>
                  {topic.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        <NearbyGroups name={topicSig.value?.name} />
        <LargestGroups name={topicSig.value?.name} />
        <NewestGroups name={topicSig.value?.name} />
      </div>
    </div>
  );
});
