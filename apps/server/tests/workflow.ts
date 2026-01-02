import { sleep } from "workflow";

export async function myTestWorkflow() {
  "use workflow";

  await sleep("5s");

  console.log("Workflow finished after 5s");
  return { status: "completed" };
}
