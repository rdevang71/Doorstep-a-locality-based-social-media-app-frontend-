import ResourcePage from "./ResourcePage";
import CommunityCard from "../components/CommunityCard";
export default function Communities() {
  return (
    <ResourcePage
      title="Find your people"
      eyebrow="COMMUNITIES"
      endpoint="/communities"
      Card={CommunityCard}
      action="request"
      fields={[
        ["name", "Community name"],
        ["description", "What is it about?"],
        ["city", "City"],
        ["locality", "Locality"],
      ]}
    />
  );
}

