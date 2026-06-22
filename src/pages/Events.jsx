import ResourcePage from "./ResourcePage";
import EventCard from "../components/EventCard";
export default function Events() {
  return (
    <ResourcePage
      title="Make plans nearby"
      eyebrow="UPCOMING EVENTS"
      endpoint="/events"
      Card={EventCard}
      action="join"
      fields={[
        ["title", "Event title"],
        ["description", "Description"],
        ["city", "City"],
        ["locality", "Locality"],
        ["venue", "Venue"],
        ["startsAt", "Start date & time", "datetime-local"],
      ]}
    />
  );
}
