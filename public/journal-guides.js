// Editorial guides: original explanations, not a list of repeated search phrases.
const product = { href: '/shop-honey/multiflora-honey', name: 'Meet Nectra Multiflora Honey' };
const source = (url, title) => `<p class="article-sources">Read more: <a href="${url}" rel="noopener noreferrer" target="_blank">${title}</a>.</p>`;
export const honeyGuides = [
 {
  slug: 'what-is-multiflora-honey', category: 'Start here', title: 'What Is Multiflora Honey? From Flowers to Your Spoon',
  subtitle: 'One jar. Many blossoms. A small story that starts outside the hive.',
  description: 'Understand multiflora honey, how it differs from single flower honey, why taste and colour vary, and how to choose a jar for your kitchen.',
  image: '/assets/journal-multiflora-botanical.png', imageAlt: 'Botanical illustration of flowers, a bee and honeycomb',
  body: `<p class="article-intro">Multiflora honey is honey made from nectar gathered from more than one kind of flower. “Multi” means many; “flora” means flowers. It describes the nectar source, not a flavour added to the jar.</p>
  <h2>Imagine a bee leaving home</h2><p>A bee does not carry a shopping list. It visits flowers that are available around its home. Different flowers bloom at different times. When nectar from several kinds of flower contributes to the honey, we call it multiflora honey.</p><p>Think of a fruit bowl rather than a single apple. The combination matters. This is an analogy for the mix of nectar sources, not a claim that honey contains pieces of flowers or fruit.</p>
  <figure class="guide-diagram"><img src="/assets/honey-journey-guide.svg" alt="Several flowers supply nectar; bees bring it to their hive; the resulting honey reaches a jar" loading="lazy"><figcaption>A simplified journey. Illustration, not a map of Nectra's foraging locations.</figcaption></figure>
  <h2>Multiflora and single flower honey: what changes?</h2><p>A single flower, or monofloral, honey has a predominant floral source. Multiflora has a mixture. Neither name, on its own, tells you that one is purer or better than the other. Choose for the flavour you like, clear product information and a source you can ask questions about.</p>
  <h2>Why can two jars look or taste different?</h2><p>Floral source and storage can affect colour. A darker jar is not automatically stronger, purer or healthier. Start with a small taste, then try it on plain toast. Notice the aroma and the finish before deciding which you prefer.</p>
  <h2>Is it the same as infused honey?</h2><p>No. Multiflora describes where the nectar came from. Infused honey describes a product with an added ingredient, such as ginger. Read the ingredient list rather than treating those two names as interchangeable.</p>
  <h2>Where does Nectra fit?</h2><p>We tend our own hives in Virudhunagar and pack our jars there. Nectra Multiflora Honey has no added sugar or additives. If you want information about your particular jar, keep its batch number when contacting us. The QR feature invites you to hear our bees; a recording is a connection to our story, not a laboratory purity test.</p>
  <h2>What can I use it for?</h2><p>Try a small drizzle over curd, oats or toast. Taste before adding more. Our <a href="/journal/three-ways-to-use-honey-with-curd-fruit-and-oats">breakfast guide</a> gives you combinations to try, and our <a href="/journal/how-to-store-honey">storage guide</a> helps you care for the jar afterwards.</p>
  ${source('https://www.sfda.gov.sa/sites/default/files/2024-07/EducationalGuideHoney-Investors.pdf','Saudi Food and Drug Authority: honey educational guide')}`
 },
 {
  slug: 'how-to-check-pure-honey', category: 'Buying with confidence', title: 'How to Check Pure Honey: What Home Tests Cannot Tell You',
  subtitle: 'Before you reach for a glass of water, reach for the label.',
  description: 'Can a water test, thickness or crystals prove honey is pure? Learn what to check on the label and what to ask a honey producer before buying.',
  image: '/assets/journal-label-checklist.svg', imageAlt: 'Illustrated honey label checklist',
  body: `<p class="article-intro">No single kitchen trick can establish that a jar is pure honey. Water tests, thickness and crystals can look convincing, but they do not give you a complete picture of what is inside.</p>
  <h2>The glass of water story</h2><p>You may have seen a video: a spoonful sinks, so someone calls it pure. The problem is the conclusion. Scientists interviewed by ABC explained why these simple tests are unreliable. A kitchen demonstration is not the same thing as an analysis of the product.</p><p>It is a little like judging a book by its weight. You have measured something, but not the thing you wanted to know. Do not try flame tests; they add risk without giving you a dependable answer.</p>
  <h2>Does crystallisation prove purity?</h2><p>No. Crystals are a change in texture, not a certificate. A jar remaining liquid is not proof of adulteration either. Read <a href="/journal/why-honey-crystallises">our crystallisation guide</a> to understand the change without jumping to a conclusion.</p>
  <h2>A better five minute buying check</h2><ol><li><strong>Read what the product is.</strong> Is it honey or a blend with other ingredients?</li><li><strong>Read the ingredients.</strong> Ask the seller if an online photograph is too small to read.</li><li><strong>Find the producer and batch.</strong> Keep those details so a question can be traced to your jar.</li><li><strong>Check dates and the seal.</strong> A beautiful label does not replace practical checks.</li><li><strong>Ask about evidence.</strong> If a seller advertises a test, ask which test, which batch and whether you can see the report.</li></ol>
  <aside class="article-callout"><b>A question you can copy</b><p>“Could you share the ingredient list, source and available test information for this batch?” A specific question is more useful than asking whether a jar is “the best”.</p></aside>
  <h2>What we can tell you at Nectra</h2><p>Our multiflora jar comes from our own hives in Virudhunagar and contains no added sugar or additives. You can ask us about your batch. We do not present the scan and listen feature as proof of purity: it lets you hear the bees behind our story. For the rest of your shopping check, use our <a href="/journal/honey-label-checklist">honey label checklist</a>.</p>
  ${source('https://www.abc.net.au/news/2018-10-04/fake-honey-test-not-reliable-scientists/10332922','ABC: scientists explain why DIY honey tests are unreliable')}`
 },
 {
  slug: 'why-honey-crystallises', category: 'Jar care', title: 'Why Does Honey Crystallise? A Simple Guide to a Grainy Jar',
  subtitle: 'Your honey has changed its texture. Here is how to understand it.',
  description: 'Why honey becomes grainy or solid, whether crystals mean fake honey, and what to check before gently softening a crystallised jar.',
  image: '/assets/honey-texture-guide.svg', imageAlt: 'An illustrated liquid honey jar beside a jar containing honey crystals',
  body: `<p class="article-intro">Honey can crystallise naturally. Some of its dissolved sugars form crystals, making it cloudy, grainy or more solid. Crystals alone do not mean it is spoiled, and they do not prove that it is pure.</p>
  <h2>What is happening inside the jar?</h2><p>Imagine a crowded room where a few people start standing in neat groups. Honey's sugars can arrange themselves into crystals too. This is only a simple picture of the process, but it explains why something that used to pour can become something you spread.</p>
  <h2>Why did this jar set before the other one?</h2><p>Floral source affects the way honey crystallises. Storage conditions matter too. Two jars do not have to change at the same speed. Comparing them is interesting, but it is not a reliable purity test.</p>
  <figure class="guide-diagram"><img src="/assets/honey-texture-guide.svg" alt="Liquid honey and grainy honey are two possible textures; texture alone is not proof of purity" loading="lazy"><figcaption>Two textures, not a good honey versus bad honey comparison.</figcaption></figure>
  <h2>Do I have to make it runny again?</h2><p>No. If the jar is sound, properly stored and within its labelled date, its spreadable texture may suit toast perfectly. Use a clean, dry spoon. You do not have to change it just because it looks different from the product photograph.</p>
  <h2>What if I want a drizzle?</h2><p>Gentle warmth can help soften crystals. Check that your container is suitable and follow the producer's instructions. Avoid boiling water, direct heat and heating a sealed container. If you do not know whether your jar is heat safe, ask before warming it.</p>
  <h2>When should I stop and ask?</h2><p>If the jar is leaking, smells unusual or has an uncertain storage history, do not assume crystals explain everything. Contact the producer with a photo and batch number. A photograph cannot establish food safety.</p>
  <aside class="article-callout"><b>Remember this</b><p>Texture tells you how honey feels. It does not tell the whole story of what is in it.</p></aside>
  <p>Next, learn <a href="/journal/how-to-store-honey">how to store honey</a> or use our <a href="/journal/how-to-check-pure-honey">buying checklist</a>.</p>
  ${source('https://www.scu.edu.au/media/scu-dep/research/documents/Crystalisation-Fact-Sheet-Final-cs-pw02092024.pdf','Southern Cross University: crystallisation fact sheet')}`
 },
 {
  slug: 'how-to-store-honey', category: 'Jar care', title: 'How to Store Honey: Fridge, Shelf Life and Everyday Care',
  subtitle: 'Give your jar a dry home, not a place beside the steaming kettle.',
  description: 'Should honey go in the fridge? Does honey expire? Learn how to store honey, keep moisture out and check a jar before using it.',
  image: '/assets/journal-kitchen-ritual.png', imageAlt: 'Honey in a warm kitchen setting',
  body: `<p class="article-intro">Keep Nectra Honey tightly closed in a cool, dry place, away from direct sunlight and heat. Use a clean, dry spoon. Follow the use by date and storage instructions printed on your jar.</p>
  <h2>The spoon that brought tea back home</h2><p>Picture breakfast. You stir honey into a cup, then put the wet spoon back in the jar for another helping. A tiny amount of tea goes in with it. An easy habit solves this: take honey with a separate dry spoon, then stir your drink with another one.</p>
  <h2>Should I keep honey in the fridge?</h2><p>Not for an ordinary Nectra honey jar: our label says not to refrigerate. Cooler conditions can encourage crystallisation. Pick a cupboard away from the stove instead. For blends or other products, check their own instructions.</p>
  <h2>Does honey expire?</h2><p>Honey's low water content helps it keep for a long time. That is not a promise that every opened jar stays suitable forever. Storage, contamination and the condition of the container still matter. Use the labelled date rather than replacing it with an internet claim that honey “never expires”.</p>
  <h2>Three checks before your next spoonful</h2><ol><li><strong>The label:</strong> check the date and storage instructions.</li><li><strong>The jar:</strong> look for a damaged seal or leakage.</li><li><strong>The history:</strong> think about where it has been stored and whether water or food has entered it.</li></ol><p>If something smells unusual or you are unsure, ask the producer before eating it. Do not taste a questionable jar just to test it.</p>
  <h2>Is grainy honey the same as spoiled honey?</h2><p>No. Crystallisation can be a natural texture change. Read <a href="/journal/why-honey-crystallises">why honey crystallises</a> rather than throwing out a jar on appearance alone. Equally, do not use crystals as reassurance when other things are wrong.</p>
  <h2>Which jar size makes sense?</h2><p>Think about your breakfast routine. A smaller jar is a simple starting point if you use honey occasionally. Compare the price per 100 g when choosing sizes, but do not buy more than you expect to use within the labelled date.</p>
  <aside class="article-callout"><b>Your cupboard reminder</b><p>Dry spoon. Closed lid. Away from heat. Check the date.</p></aside>
  ${source('https://extension.psu.edu/storing-staple-ingredients-in-the-kitchen','Penn State Extension: storing staple ingredients')}`
 }
].map(article => ({ ...article, date: 'November 13, 2026', dateISO: '2026-11-13', modifiedISO: '2026-11-13', readTime: '4 minute read', product }));
