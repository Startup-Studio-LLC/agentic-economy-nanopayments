import { ensureSeedData, getFeaturedTool, getSeller } from "../src/lib/store";

async function main() {
  await ensureSeedData();
  const seller = await getSeller();
  const tool = await getFeaturedTool();

  console.log(
    JSON.stringify(
      {
        seller,
        tool,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
