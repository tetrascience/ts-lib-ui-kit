import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { CarouselApi } from "@/components/ui/carousel";
import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";




export type InlineCitationProps = ComponentProps<"span">;

const InlineCitation = ({
  className,
  ...props
}: InlineCitationProps) => (
  <span
    className={cn("group inline items-center gap-1", className)}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationWithRef = withRef("InlineCitation", InlineCitation);
export { InlineCitationWithRef as InlineCitation };

export type InlineCitationTextProps = ComponentProps<"span">;

const InlineCitationText = ({
  className,
  ...props
}: InlineCitationTextProps) => (
  <span
    className={cn("transition-colors group-hover:bg-accent", className)}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationTextWithRef = withRef("InlineCitationText", InlineCitationText);
export { InlineCitationTextWithRef as InlineCitationText };

const getHostname = (source: string) => {
  try {
    return new URL(source).hostname;
  } catch {
    return source;
  }
};

export type InlineCitationCardProps = ComponentProps<typeof HoverCard>;

export const InlineCitationCard = (props: InlineCitationCardProps) => (
  <HoverCard closeDelay={0} openDelay={0} {...props} />
);

export type InlineCitationCardTriggerProps = ComponentProps<typeof Badge> & {
  sources: string[];
};

const InlineCitationCardTrigger = ({
  sources,
  className,
  ...props
}: InlineCitationCardTriggerProps) => (
  <HoverCardTrigger asChild>
    <Badge
      className={cn("ml-1 rounded-full", className)}
      variant="secondary"
      {...props}
    >
      {sources[0] ? (
        <>
          {getHostname(sources[0])}{" "}
          {sources.length > 1 && `+${sources.length - 1}`}
        </>
      ) : (
        "unknown"
      )}
    </Badge>
  </HoverCardTrigger>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationCardTriggerWithRef = withRef("InlineCitationCardTrigger", InlineCitationCardTrigger);
export { InlineCitationCardTriggerWithRef as InlineCitationCardTrigger };

export type InlineCitationCardBodyProps = ComponentProps<"div">;

const InlineCitationCardBody = ({
  className,
  ...props
}: InlineCitationCardBodyProps) => (
  <HoverCardContent className={cn("relative w-80 p-0", className)} {...props} />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationCardBodyWithRef = withRef("InlineCitationCardBody", InlineCitationCardBody);
export { InlineCitationCardBodyWithRef as InlineCitationCardBody };

const CarouselApiContext = createContext<CarouselApi | undefined>(undefined);

const useCarouselApi = () => {
  return useContext(CarouselApiContext);
};

export type InlineCitationCarouselProps = ComponentProps<typeof Carousel>;

const InlineCitationCarousel = ({
  className,
  children,
  ...props
}: InlineCitationCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();

  return (
    <CarouselApiContext.Provider value={api}>
      <Carousel className={cn("w-full", className)} setApi={setApi} {...props}>
        {children}
      </Carousel>
    </CarouselApiContext.Provider>
  );
};

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationCarouselWithRef = withRef("InlineCitationCarousel", InlineCitationCarousel);
export { InlineCitationCarouselWithRef as InlineCitationCarousel };

export type InlineCitationCarouselContentProps = ComponentProps<"div">;

const InlineCitationCarouselContent = (
  props: InlineCitationCarouselContentProps
) => <CarouselContent {...props} />;

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationCarouselContentWithRef = withRef("InlineCitationCarouselContent", InlineCitationCarouselContent);
export { InlineCitationCarouselContentWithRef as InlineCitationCarouselContent };

export type InlineCitationCarouselItemProps = ComponentProps<"div">;

const InlineCitationCarouselItem = ({
  className,
  ...props
}: InlineCitationCarouselItemProps) => (
  <CarouselItem
    className={cn("w-full space-y-2 p-4 pl-8", className)}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationCarouselItemWithRef = withRef("InlineCitationCarouselItem", InlineCitationCarouselItem);
export { InlineCitationCarouselItemWithRef as InlineCitationCarouselItem };

export type InlineCitationCarouselHeaderProps = ComponentProps<"div">;

const InlineCitationCarouselHeader = ({
  className,
  ...props
}: InlineCitationCarouselHeaderProps) => (
  <div
    className={cn(
      "flex items-center justify-between gap-2 rounded-t-md bg-secondary p-2",
      className
    )}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationCarouselHeaderWithRef = withRef("InlineCitationCarouselHeader", InlineCitationCarouselHeader);
export { InlineCitationCarouselHeaderWithRef as InlineCitationCarouselHeader };

export type InlineCitationCarouselIndexProps = ComponentProps<"div">;

const InlineCitationCarouselIndex = ({
  children,
  className,
  ...props
}: InlineCitationCarouselIndexProps) => {
  const api = useCarouselApi();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const syncState = useCallback(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    syncState();

    api.on("select", syncState);

    return () => {
      api.off("select", syncState);
    };
  }, [api, syncState]);

  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-end px-3 py-1 text-muted-foreground text-xs",
        className
      )}
      {...props}
    >
      {children ?? `${current}/${count}`}
    </div>
  );
};

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationCarouselIndexWithRef = withRef("InlineCitationCarouselIndex", InlineCitationCarouselIndex);
export { InlineCitationCarouselIndexWithRef as InlineCitationCarouselIndex };

export type InlineCitationCarouselPrevProps = ComponentProps<"button">;

const InlineCitationCarouselPrev = ({
  className,
  ...props
}: InlineCitationCarouselPrevProps) => {
  const api = useCarouselApi();

  const handleClick = useCallback(() => {
    if (api) {
      api.scrollPrev();
    }
  }, [api]);

  return (
    <button
      aria-label="Previous"
      className={cn("shrink-0", className)}
      onClick={handleClick}
      type="button"
      {...props}
    >
      <ArrowLeftIcon className="size-4 text-muted-foreground" />
    </button>
  );
};

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationCarouselPrevWithRef = withRef("InlineCitationCarouselPrev", InlineCitationCarouselPrev);
export { InlineCitationCarouselPrevWithRef as InlineCitationCarouselPrev };

export type InlineCitationCarouselNextProps = ComponentProps<"button">;

const InlineCitationCarouselNext = ({
  className,
  ...props
}: InlineCitationCarouselNextProps) => {
  const api = useCarouselApi();

  const handleClick = useCallback(() => {
    if (api) {
      api.scrollNext();
    }
  }, [api]);

  return (
    <button
      aria-label="Next"
      className={cn("shrink-0", className)}
      onClick={handleClick}
      type="button"
      {...props}
    >
      <ArrowRightIcon className="size-4 text-muted-foreground" />
    </button>
  );
};

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationCarouselNextWithRef = withRef("InlineCitationCarouselNext", InlineCitationCarouselNext);
export { InlineCitationCarouselNextWithRef as InlineCitationCarouselNext };

export type InlineCitationSourceProps = ComponentProps<"div"> & {
  title?: string;
  url?: string;
  description?: string;
};

const InlineCitationSource = ({
  title,
  url,
  description,
  className,
  children,
  ...props
}: InlineCitationSourceProps) => (
  <div className={cn("space-y-1", className)} {...props}>
    {title && (
      <h4 className="truncate font-medium text-sm leading-tight">{title}</h4>
    )}
    {url && (
      <p className="truncate break-all text-muted-foreground text-xs">{url}</p>
    )}
    {description && (
      <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    )}
    {children}
  </div>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationSourceWithRef = withRef("InlineCitationSource", InlineCitationSource);
export { InlineCitationSourceWithRef as InlineCitationSource };

export type InlineCitationQuoteProps = ComponentProps<"blockquote">;

const InlineCitationQuote = ({
  children,
  className,
  ...props
}: InlineCitationQuoteProps) => (
  <blockquote
    className={cn(
      "border-muted border-l-2 pl-3 text-muted-foreground text-sm italic",
      className
    )}
    {...props}
  >
    {children}
  </blockquote>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const InlineCitationQuoteWithRef = withRef("InlineCitationQuote", InlineCitationQuote);
export { InlineCitationQuoteWithRef as InlineCitationQuote };
