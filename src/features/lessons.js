export const phaseData = [
  {
    id: 1,
    short: "Field notes",
    title: "Keep clear field notes",
    icon: "▤",
    summary: "Record what you see, remember what you checked, and plan your next visit.",
    description: "A short field note can help you notice changes in crops, soil, and water use. Try adding a note, keeping track of a field check, and planning which field to visit next.",
    reward: 40,
    badge: "Careful Observer",
    badgeIcon: "▤",
    farmTip: "Write down the date, field, weather, and what you noticed. Regular notes can help you spot changes over time.",
    tasks: [
      { id: "observation", label: "Write down one thing you noticed about a field, crop, or soil today." },
      { id: "field-check", label: "Check one field and note what needs attention next." },
      { id: "visit-plan", label: "Choose which field you will visit first on your next round." },
      { id: "water-notes", label: "Write down how much water one field received, if you know it." },
    ],
    quiz: [
      { question: "Why is it useful to write down what you notice in a field?", options: ["It helps you notice changes over time.", "It means you never need to visit the field again.", "It guarantees a larger harvest."], answer: 0, explanation: "Notes help you compare what you see on different days and decide what may need attention." },
      { question: "When several fields need checking, what is a sensible way to choose where to start?", options: ["Visit the field with the most urgent need first.", "Always visit fields in alphabetical order.", "Skip the fields you have not checked before."], answer: 0, explanation: "A clear visit plan helps you check the fields that need attention while keeping track of the others." },
      { question: "What should you do if you notice a change in a crop or soil?", options: ["Make a note of what changed and when.", "Wait until the end of the year to remember it.", "Assume the same thing is happening everywhere."], answer: 0, explanation: "A dated note gives you something useful to compare with your next visit." },
    ],
  },
  {
    id: 2,
    short: "Crop connections",
    title: "Notice how crops and practices connect",
    icon: "⌘",
    summary: "Compare field readings and explore practices that support healthy soil.",
    description: "Fields are connected by the choices you make over time. Compare sample soil-moisture readings, then explore how cover crops, compost, crop rotation, and other practices can support one another.",
    reward: 50,
    badge: "Soil Supporter",
    badgeIcon: "⌘",
    farmTip: "Cover crops can help protect bare soil between growing seasons. Choose crops and practices that suit your climate, soil, and local guidance.",
    tasks: [
      { id: "moisture-check", label: "Compare the sample readings and pick one field you would check first." },
      { id: "reading-review", label: "Look up one reading and decide whether you would record a follow-up check." },
      { id: "practice-connections", label: "Explore how two soil-care practices can work together." },
    ],
    quiz: [
      { question: "Why do farmers grow a cover crop between main crops?", options: ["To help keep soil covered and protected.", "To make the soil dry as quickly as possible.", "To stop keeping field notes."], answer: 0, explanation: "Cover crops can protect soil between growing seasons. The right choice depends on local conditions." },
      { question: "What is a helpful way to compare two fields?", options: ["Compare observations made in similar conditions.", "Compare a rainy-day reading with a dry-season reading without noting the difference.", "Use a different measuring method each time."], answer: 0, explanation: "Recording when and how you measured makes field comparisons more useful." },
      { question: "What can compost add to a farm's soil-care practices?", options: ["Organic matter that can support soil health.", "A guarantee that crops will never get pests.", "A reason to stop checking the soil."], answer: 0, explanation: "Compost adds organic matter; its use should fit the crop and local soil needs." },
    ],
  },
  {
    id: 3,
    short: "Find patterns",
    title: "Find patterns in field readings",
    icon: "↕",
    summary: "Put readings in order and find the one you need.",
    description: "Putting field readings side by side can make it easier to spot dry or unusually wet areas. Try arranging the sample readings from low to high, then find a reading in the list.",
    reward: 60,
    badge: "Pattern Finder",
    badgeIcon: "⌕",
    farmTip: "Compare readings taken with the same method and around the same time. A single number does not tell the whole story about a field.",
    tasks: [
      { id: "sort", label: "Arrange the sample readings and notice which fields are driest and wettest." },
      { id: "search", label: "Find one reading and note which field it belongs to." },
    ],
    quiz: [
      { question: "Before comparing moisture readings from different fields, what should you check?", options: ["That they were measured in a similar way and conditions are noted.", "That the numbers are written in alphabetical order.", "That every reading is exactly the same."], answer: 0, explanation: "Similar measuring conditions make comparisons more meaningful; note differences such as recent rain." },
      { question: "What can arranging readings from low to high help you notice?", options: ["Which readings are lower or higher than the others.", "Which crop will definitely succeed.", "How much rain will fall next month."], answer: 0, explanation: "An ordered list can make differences easier to see, but it cannot predict crop outcomes by itself." },
      { question: "One reading is much lower than the others. What is a sensible next step?", options: ["Check the field and consider weather, soil, and crop needs.", "Water every field immediately.", "Ignore it because one reading is always wrong."], answer: 0, explanation: "Use the reading as a reason to investigate, not as a complete watering instruction." },
    ],
  },
  {
    id: 4,
    short: "Plan water",
    title: "Plan careful water use",
    icon: "✳",
    summary: "Make a sample watering plan when water is limited.",
    description: "When water is limited, it helps to think through which fields need it most. Try the sample planner, review how it uses the available water, and remember to use your own field checks and local advice for real decisions.",
    reward: 75,
    badge: "Water Steward",
    badgeIcon: "◈",
    farmTip: "This planner is a learning example, not a watering recommendation. Real decisions depend on crop, soil, weather, water availability, and local guidance.",
    tasks: [
      { id: "greedy", label: "Try a water plan using the sample fields and water amount." },
      { id: "reasoning", label: "Review the plan and decide what you would check before watering your own fields." },
    ],
    quiz: [
      { question: "Before deciding which field to water, what should you consider?", options: ["Crop and soil needs, recent weather, and water available.", "Only the order of the field names.", "The sample plan without checking your own fields."], answer: 0, explanation: "Use current field observations, crop and soil needs, weather, and available water to guide real decisions." },
      { question: "If the sample plan skips a field, what should you do before using that plan on your farm?", options: ["Check your own field conditions and local guidance.", "Assume the sample plan is always right.", "Water all fields the same amount without checking."], answer: 0, explanation: "The sample plan uses made-up values. Your farm's conditions and local advice matter." },
      { question: "What is the purpose of planning when water is limited?", options: ["Think carefully about where water is needed and keep track of the amount.", "Guarantee that no crop will ever need more water.", "Replace checking the fields."], answer: 0, explanation: "Planning helps you make thoughtful use of limited water, but it does not replace checking crops and soil." },
    ],
  },
];

export const starterRecords = [
  { name: "North field", moisture: 34 },
  { name: "Orchard", moisture: 58 },
  { name: "Cover crop", moisture: 42 },
  { name: "Kitchen garden", moisture: 27 },
  { name: "South field", moisture: 65 },
  { name: "Greenhouse", moisture: 49 },
  { name: "West beds", moisture: 37 },
  { name: "East field", moisture: 53 },
];

export const practicesGraph = new Map([
  ["Composting", ["Cover crops", "Crop rotation", "Mulching"]],
  ["Cover crops", ["Composting", "Crop rotation", "Reduced tillage"]],
  ["Crop rotation", ["Composting", "Cover crops", "Integrated pest management"]],
  ["Mulching", ["Composting", "Drip irrigation"]],
  ["Drip irrigation", ["Mulching", "Rainwater harvesting"]],
  ["Rainwater harvesting", ["Drip irrigation", "Agroforestry"]],
  ["Agroforestry", ["Rainwater harvesting", "Integrated pest management"]],
  ["Reduced tillage", ["Cover crops", "Integrated pest management"]],
  ["Integrated pest management", ["Crop rotation", "Agroforestry", "Reduced tillage"]],
]);

export const irrigationPlots = [
  { id: "seedlings", name: "New seedlings", liters: 14, benefit: 10, selected: true, reason: "Young plants may need careful checks as their roots establish." },
  { id: "vegetables", name: "Vegetable beds", liters: 22, benefit: 13, selected: true, reason: "Check crop growth and soil moisture before watering." },
  { id: "orchard", name: "Young orchard", liters: 30, benefit: 15, selected: true, reason: "Young trees may need attention during dry weather." },
  { id: "cover", name: "Cover-crop strip", liters: 12, benefit: 7, selected: true, reason: "A cover crop helps keep soil covered between crop cycles." },
];
