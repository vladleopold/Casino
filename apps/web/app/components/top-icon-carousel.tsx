import Image from "next/image";

type TopIconCarouselItem = {
  id: string;
  title: string;
  image: string;
  rank?: string;
};

interface TopIconCarouselProps {
  items: TopIconCarouselItem[];
  className?: string;
}

function CarouselTrack({
  items,
  hidden = false
}: {
  items: TopIconCarouselItem[];
  hidden?: boolean;
}) {
  return (
    <div className="slotcity-top10-track" aria-hidden={hidden}>
      {items.map((item, index) => (
        <div
          key={`${hidden ? "clone" : "primary"}-${item.id}-${index}`}
          className="slotcity-top10-chip"
          title={`${item.rank ?? String(index + 1)}. ${item.title}`}
        >
          <div className="slotcity-top10-chip-media">
            <Image src={item.image} alt={item.title} fill sizes="164px" />
            <span className="slotcity-top10-chip-rank">{item.rank ?? String(index + 1)}</span>
          </div>
          <span className="slotcity-sr-only">{item.title}</span>
        </div>
      ))}
    </div>
  );
}

export function TopIconCarousel({ items, className }: TopIconCarouselProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className={["slotcity-top10-carousel", className].filter(Boolean).join(" ")}>
      <div className="slotcity-top10-viewport" aria-label="ТОП 10">
        <div className="slotcity-top10-marquee">
          <CarouselTrack items={items} />
          <CarouselTrack items={items} hidden />
        </div>
      </div>
    </div>
  );
}
