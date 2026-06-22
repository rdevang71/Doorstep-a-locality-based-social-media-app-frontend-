import ResourcePage from "./ResourcePage";
import BusinessCard from "../components/BusinessCard";
export default function BusinessPages() {
  return (
    <ResourcePage
      title="Shop the neighbourhood"
      eyebrow="LOCAL BUSINESSES"
      endpoint="/business-pages"
      Card={BusinessCard}
      action="follow"
      fields={[
        ["name", "Business name"],
        ["description", "What do you offer?"],
        ["category", "Category"],
        ["city", "City"],
        ["locality", "Locality"],
      ]}
    />
  );
}
