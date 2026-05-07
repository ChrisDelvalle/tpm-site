import { SITE_TITLE } from "./routes";
import { siteConfig } from "./site-config";
import type { SocialPreviewImage } from "./social-images";

const threadsMaxPostLength = 500;
const articleShareTargetConfig = {
  attribution: {
    threadsMention: siteConfig.share.threadsMention,
    xViaHandle: siteConfig.share.xViaHandle,
  },
  endpoints: {
    bluesky: "https://bsky.app/intent/compose",
    facebook: "https://www.facebook.com/sharer/sharer.php",
    hackerNews: "https://news.ycombinator.com/submitlink",
    linkedIn: "https://www.linkedin.com/sharing/share-offsite/",
    pinterest: "https://www.pinterest.com/pin/create/button/",
    reddit: "https://www.reddit.com/submit",
    threads: "https://www.threads.com/intent/post",
    x: "https://twitter.com/intent/tweet",
  },
  siteName: SITE_TITLE,
} as const;

/** External public composer targets supported by the article share menu. */
type ArticleShareExternalTargetId =
  | "bluesky"
  | "facebook"
  | "hacker-news"
  | "linkedin"
  | "pinterest"
  | "reddit"
  | "threads"
  | "x";

/** A normalized article share action rendered by the article share menu. */
export type ArticleShareAction =
  | {
      readonly copyText: string;
      readonly id: "copy-link";
      readonly kind: "copy";
      readonly label: "Copy link";
    }
  | {
      readonly href: string;
      readonly id: "email";
      readonly kind: "email";
      readonly label: "Email";
    }
  | {
      readonly href: string;
      readonly id: ArticleShareExternalTargetId;
      readonly kind: "external";
      readonly label: string;
    };

/** Display-ready share menu data for one article. */
export interface ArticleShareMenuViewModel {
  readonly actions: readonly ArticleShareAction[];
  readonly articleUrl: string;
  readonly copyText: string;
  readonly title: string;
}

interface ArticleShareMenuViewModelInput {
  readonly articleUrl: string;
  readonly description?: string | undefined;
  readonly image?: SocialPreviewImage | undefined;
  readonly title: string;
}

interface ArticleShareTargetContext {
  readonly articleUrl: string;
  readonly description: string;
  readonly image?: SocialPreviewImage | undefined;
  readonly title: string;
}

interface ExternalShareTargetDefinition {
  readonly buildHref: (context: ArticleShareTargetContext) => string;
  readonly id: ArticleShareExternalTargetId;
  readonly label: string;
  readonly requiresImage?: boolean;
}

const externalShareTargetDefinitions = [
  {
    buildHref: ({ articleUrl, title }) =>
      urlWithQuery(articleShareTargetConfig.endpoints.bluesky, {
        text: shareText(title, articleUrl),
      }),
    id: "bluesky",
    label: "Bluesky",
    requiresImage: false,
  },
  {
    buildHref: ({ articleUrl, title }) =>
      urlWithQuery(articleShareTargetConfig.endpoints.x, {
        text: title,
        url: articleUrl,
        via: articleShareTargetConfig.attribution.xViaHandle,
      }),
    id: "x",
    label: "X",
    requiresImage: false,
  },
  {
    buildHref: ({ articleUrl, title }) =>
      urlWithQuery(articleShareTargetConfig.endpoints.threads, {
        text: threadsShareText(title, articleUrl),
      }),
    id: "threads",
    label: "Threads",
    requiresImage: false,
  },
  {
    buildHref: ({ articleUrl }) =>
      urlWithQuery(articleShareTargetConfig.endpoints.facebook, {
        u: articleUrl,
      }),
    id: "facebook",
    label: "Facebook",
    requiresImage: false,
  },
  {
    buildHref: ({ articleUrl }) =>
      urlWithQuery(articleShareTargetConfig.endpoints.linkedIn, {
        url: articleUrl,
      }),
    id: "linkedin",
    label: "LinkedIn",
    requiresImage: false,
  },
  {
    buildHref: ({ articleUrl, title }) =>
      urlWithQuery(articleShareTargetConfig.endpoints.reddit, {
        title,
        url: articleUrl,
      }),
    id: "reddit",
    label: "Reddit",
    requiresImage: false,
  },
  {
    buildHref: ({ articleUrl, title }) =>
      urlWithQuery(articleShareTargetConfig.endpoints.hackerNews, {
        t: title,
        u: articleUrl,
      }),
    id: "hacker-news",
    label: "Hacker News",
    requiresImage: false,
  },
  {
    buildHref: ({ articleUrl, description, image, title }) =>
      urlWithQuery(articleShareTargetConfig.endpoints.pinterest, {
        description: description.length === 0 ? title : description,
        media: image?.src ?? "",
        url: articleUrl,
      }),
    id: "pinterest",
    label: "Pinterest",
    requiresImage: true,
  },
] as const satisfies readonly ExternalShareTargetDefinition[];

/**
 * Builds the article share menu view model from canonical article metadata.
 *
 * @param input Article title, canonical URL, optional description, and preview.
 * @returns Display-ready copy, email, and external share actions.
 */
export function articleShareMenuViewModel(
  input: ArticleShareMenuViewModelInput,
): ArticleShareMenuViewModel {
  const articleUrl = input.articleUrl.trim();
  const title = input.title.trim();
  const description = input.description?.trim() ?? "";
  const context = {
    articleUrl,
    description,
    ...(input.image === undefined ? {} : { image: input.image }),
    title,
  } satisfies ArticleShareTargetContext;
  const copyAction = {
    copyText: articleUrl,
    id: "copy-link",
    kind: "copy",
    label: "Copy link",
  } as const satisfies ArticleShareAction;
  const emailAction = {
    href: emailShareHref(context),
    id: "email",
    kind: "email",
    label: "Email",
  } as const satisfies ArticleShareAction;
  const externalActions = externalShareTargetDefinitions
    .filter((target) => !target.requiresImage || input.image !== undefined)
    .map((target) => ({
      href: target.buildHref(context),
      id: target.id,
      kind: "external",
      label: target.label,
    })) satisfies readonly ArticleShareAction[];

  return {
    actions: [copyAction, emailAction, ...externalActions],
    articleUrl,
    copyText: articleUrl,
    title,
  };
}

function emailShareHref(context: ArticleShareTargetContext): string {
  return `mailto:?${new URLSearchParams({
    body: `${shareText(context.title, context.articleUrl)}\n\n${articleShareTargetConfig.siteName}`,
    subject: context.title,
  }).toString()}`;
}

function shareText(title: string, articleUrl: string): string {
  return `${title}\n\n${articleUrl}`;
}

function threadsShareText(title: string, articleUrl: string): string {
  const suffix =
    articleShareTargetConfig.attribution.threadsMention === undefined
      ? `\n\n${articleUrl}`
      : `\n\n${articleUrl}\n\n${articleShareTargetConfig.attribution.threadsMention}`;
  const titleLimit = threadsMaxPostLength - suffix.length;
  const safeTitle =
    title.length <= titleLimit ? title : `${title.slice(0, titleLimit - 3)}...`;

  return `${safeTitle}${suffix}`;
}

function urlWithQuery(
  href: string,
  params: Record<string, string | undefined>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();

  return query.length === 0 ? href : `${href}?${query}`;
}
