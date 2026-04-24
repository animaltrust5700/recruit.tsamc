// ─── WPGraphQL Response Types ─────────────────────────────────────────────

export interface WPFeaturedImage {
  readonly node: {
    readonly sourceUrl: string;
    readonly altText: string;
  } | null;
}

export interface WPAuthor {
  readonly node: {
    readonly name: string;
  };
}

export interface WPNewsCat {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

export interface WPPost {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly date: string;
  readonly author: WPAuthor;
  readonly featuredImage: WPFeaturedImage | null;
}

export interface WPNewsItem extends WPPost {
  readonly newsCats: {
    readonly nodes: readonly WPNewsCat[];
  };
  readonly content: string;
}

interface GraphQLResponse<T> {
  readonly data: T;
  readonly errors?: readonly { readonly message: string }[];
}

interface PostsAndNewsData {
  readonly posts: { readonly nodes: readonly WPPost[] };
  readonly newsItems: { readonly nodes: readonly WPNewsItem[] };
}

// ─── GraphQL Endpoint ──────────────────────────────────────────────────────

const DEFAULT_GRAPHQL_ENDPOINT = "https://www.wp.example.jp/graphql";

function getEndpoint(): string {
  return import.meta.env.WPGRAPHQL_ENDPOINT ?? DEFAULT_GRAPHQL_ENDPOINT;
}

async function gqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T | null> {
  try {
    const res = await fetch(getEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      console.warn(`[WPGraphQL] API returned ${res.status}`);
      return null;
    }

    const json = (await res.json()) as GraphQLResponse<T>;

    if (json.errors?.length) {
      console.warn(
        "[WPGraphQL] GraphQL errors:",
        json.errors.map((e) => e.message).join(", "),
      );
      return null;
    }

    return json.data;
  } catch (err) {
    console.warn("[WPGraphQL] Fetch failed:", err);
    return null;
  }
}

// ─── Queries ───────────────────────────────────────────────────────────────

const GET_POSTS_AND_NEWS = `
  query GetPostsAndNews($count: Int = 10) {
    posts(first: $count) {
      nodes {
        id
        title
        slug
        date
        author {
          node {
            name
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
    newsItems(first: $count) {
      nodes {
        id
        title
        slug
        date
        content
        author {
          node {
            name
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        newsCats {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
  }
`;

// ─── Dummy Fallback Data ───────────────────────────────────────────────────

const DUMMY_NEWS_ITEMS: readonly WPNewsItem[] = [
  {
    id: "dummy-1",
    title: "テスト投稿です",
    slug: "opening-announcement",
    date: "2026-02-15T00:00:00",
    content: "<p>テスト投稿です</p>",
    author: { node: { name: "テストユーザー" } },
    featuredImage: null,
    newsCats: { nodes: [{ id: "cat-1", name: "お知らせ", slug: "info" }] },
  },
];

// ─── Fetch Functions ───────────────────────────────────────────────────────

export async function fetchPostsAndNews(count = 5): Promise<{
  readonly posts: readonly WPPost[];
  readonly newsItems: readonly WPNewsItem[];
}> {
  const data = await gqlFetch<PostsAndNewsData>(GET_POSTS_AND_NEWS, { count });

  if (!data) {
    return {
      posts: [],
      newsItems: DUMMY_NEWS_ITEMS.slice(0, count),
    };
  }

  return {
    posts: data.posts.nodes,
    newsItems: data.newsItems.nodes,
  };
}

export async function fetchAllNewsItems(): Promise<readonly WPNewsItem[]> {
  const data = await gqlFetch<PostsAndNewsData>(GET_POSTS_AND_NEWS, {
    count: 100,
  });
  return data?.newsItems.nodes ?? DUMMY_NEWS_ITEMS;
}

export async function fetchNewsItemBySlug(
  slug: string,
): Promise<WPNewsItem | null> {
  const items = await fetchAllNewsItems();
  return items.find((item) => item.slug === slug) ?? null;
}

// ─── Utilities ─────────────────────────────────────────────────────────────

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
