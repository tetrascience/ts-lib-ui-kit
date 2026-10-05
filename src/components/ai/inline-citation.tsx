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

const InlineCitation19 = ({
  className,
  ...props
}: InlineCitationProps) => (
  <span
    className={cn("group inline items-center gap-1", className)}
    {...props}
  />
);

export const InlineCitation = withRef("InlineCitation", InlineCitation19);

export type InlineCitationTextProps = ComponentProps<"span">;

const InlineCitationText19 = ({
  className,
  ...props
}: InlineCitationTextProps) => (
  <span
    className={cn("transition-colors group-hover:bg-accent", className)}
    {...props}
  />
);

export const InlineCitationText = withRef("InlineCitationText", InlineCitationText19);

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

const InlineCitationCardTrigger19 = ({
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

export const InlineCitationCardTrigger = withRef("InlineCitationCardTrigger", InlineCitationCardTrigger19);

export type InlineCitationCardBodyProps = ComponentProps<"div">;

const InlineCitationCardBody19 = ({
  className,
  ...props
}: InlineCitationCardBodyProps) => (
  <HoverCardContent className={cn("relative w-80 p-0", className)} {...props} />
);

export const InlineCitationCardBody = withRef("InlineCitationCardBody", InlineCitationCardBody19);

const CarouselApiContext = createContext<CarouselApi | undefined>(undefined);

const useCarouselApi = () => {
  return useContext(CarouselApiContext);
};

export type InlineCitationCarouselProps = ComponentProps<typeof Carousel>;

const InlineCitationCarousel19 = ({
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

export const InlineCitationCarousel = withRef("InlineCitationCarousel", InlineCitationCarousel19);

export type InlineCitationCarouselContentProps = ComponentProps<"div">;

const InlineCitationCarouselContent19 = (
  props: InlineCitationCarouselContentProps
) => <CarouselContent {...props} />;

export const InlineCitationCarouselContent = withRef("InlineCitationCarouselContent", InlineCitationCarouselContent19);

export type InlineCitationCarouselItemProps = ComponentProps<"div">;

const InlineCitationCarouselItem19 = ({
  className,
  ...props
}: InlineCitationCarouselItemProps) => (
  <CarouselItem
    className={cn("w-full space-y-2 p-4 pl-8", className)}
    {...props}
  />
);

export const InlineCitationCarouselItem = withRef("InlineCitationCarouselItem", InlineCitationCarouselItem19);

export type InlineCitationCarouselHeaderProps = ComponentProps<"div">;

const InlineCitationCarouselHeader19 = ({
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

export const InlineCitationCarouselHeader = withRef("InlineCitationCarouselHeader", InlineCitationCarouselHeader19);

export type InlineCitationCarouselIndexProps = ComponentProps<"div">;

const InlineCitationCarouselIndex19 = ({
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

export const InlineCitationCarouselIndex = withRef("InlineCitationCarouselIndex", InlineCitationCarouselIndex19);

export type InlineCitationCarouselPrevProps = ComponentProps<"button">;

const InlineCitationCarouselPrev19 = ({
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

export const InlineCitationCarouselPrev = withRef("InlineCitationCarouselPrev", InlineCitationCarouselPrev19);

export type InlineCitationCarouselNextProps = ComponentProps<"button">;

const InlineCitationCarouselNext19 = ({
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

export const InlineCitationCarouselNext = withRef("InlineCitationCarouselNext", InlineCitationCarouselNext19);

export type InlineCitationSourceProps = ComponentProps<"div"> & {
  title?: string;
  url?: string;
  description?: string;
};

const InlineCitationSource19 = ({
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

export const InlineCitationSource = withRef("InlineCitationSource", InlineCitationSource19);

export type InlineCitationQuoteProps = ComponentProps<"blockquote">;

const InlineCitationQuote19 = ({
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

export const InlineCitationQuote = withRef("InlineCitationQuote", InlineCitationQuote19);
