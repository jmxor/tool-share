import { auth } from "@/auth";
import ToolsPageContent from "@/components/tools-page-content";
import { getEmailID } from "@/lib/auth/actions";
import { getCategories, getTools } from "@/lib/posts/actions";

export default async function ToolsPage() {
  const session = await auth();
  let loggedIn = false;
  let currentUserId: number | null = null;

  if (session?.user?.email) {
    loggedIn = true;
    currentUserId = await getEmailID(session.user.email);
  }

  let tools = await getTools();

  if (!tools) {
    tools = [];
  }

  let categories = await getCategories();
  if (!categories) {
    categories = [];
  }

  let prevLocationId = -1;
  let toolsPerSide = 1;
  let toolsInCurrentLayerCount = 0;
  let radius = 0.0001;
  for (const tool of tools) {
    if (tool.location_id == prevLocationId) {
      if (toolsInCurrentLayerCount == toolsPerSide * 6) {
        toolsPerSide += 1;
        radius += 0.0001;
        toolsInCurrentLayerCount = 0;
      }
      const theta =
        (2 * Math.PI * toolsInCurrentLayerCount) / (toolsPerSide * 6);
      tool.latitude += radius * Math.sin(theta);
      tool.longitude += radius * Math.cos(theta);
      toolsInCurrentLayerCount += 1;
    } else {
      toolsPerSide = 1;
      radius = 0.0001;
      toolsInCurrentLayerCount = 0;
    }
    prevLocationId = tool.location_id;
  }

  return (
    <ToolsPageContent
      tools={tools}
      categories={categories}
      loggedIn={loggedIn}
      currentUserId={currentUserId}
    />
  );
}
