import type { Source, StudyUnit } from "./content.ts";
import type { StudyQuestion } from "./questions.ts";
const apt = [
  "upsc",
  "bpsc",
  "ssc",
  "sbi",
  "ibps",
  "cat",
  "gate-ee",
  "gate-ec",
  "gate-in",
  "ese",
];
const tech = ["gate-ee", "gate-ec", "gate-in", "ese"];
const sourceRows = [
  [
    "trade",
    "Discount and mark-up",
    "https://openstax.org/books/prealgebra-2e/pages/6-3-solve-sales-tax-commission-and-discount-applications",
    "OpenStax",
  ],
  [
    "work-motion",
    "Uniform motion and work applications",
    "https://openstax.org/books/elementary-algebra-2e/pages/8-8-solve-uniform-motion-and-work-applications",
    "OpenStax",
  ],
  [
    "compound",
    "Compound interest",
    "https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest",
    "OpenStax",
  ],
  [
    "centre",
    "Measures of the center of data",
    "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
    "OpenStax",
  ],
  [
    "counting",
    "Combinations",
    "https://openstax.org/books/contemporary-mathematics/pages/7-3-combinations",
    "OpenStax",
  ],
  [
    "relative",
    "Relative motion",
    "https://openstax.org/books/university-physics-volume-1/pages/4-5-relative-motion-in-one-and-two-dimensions",
    "OpenStax",
  ],
  [
    "induction",
    "Faraday and Lenz laws",
    "https://openstax.org/books/college-physics-2e/pages/23-2-faradays-law-of-induction-lenzs-law",
    "OpenStax",
  ],
  [
    "bihar-basins",
    "Bihar basins at a glance",
    "https://beams.fmiscwrdbihar.gov.in/glance/glancemaster.aspx",
    "Water Resources Department, Bihar",
  ],
  [
    "logic",
    "Mathematics for Computer Science: Logic and Propositions",
    "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_session4.pdf",
    "MIT OpenCourseWare",
  ],
];
export const releaseSources: Source[] = sourceRows.map(
  ([id, title, url, publisher]) => ({
    id,
    title,
    url,
    publisher,
    checkedOn: "2026-10-16",
    licenseNote:
      "Publisher-linked concept reference. Anvaya explanations, scenarios and questions are original; no publisher exercise, figure or video is reproduced.",
  }),
);
type UnitInput = Omit<
  StudyUnit,
  "status" | "authorship" | "review" | "version"
>;
export const releaseUnits: UnitInput[] = [
  {
    slug: "profit-discount",
    title: "Profit and discount: track both price bases",
    subject: "Quantitative Aptitude",
    exams: apt,
    sourceId: "trade",
    minutes: 25,
    objective:
      "Distinguish cost, marked price and selling price in a two-stage calculation.",
    concepts: [
      {
        title: "Two different bases",
        text: "A discount is measured against marked price. Profit or loss is measured against cost. Write SP = MP(1−d) and profit percentage = (SP−CP)/CP ×100.",
      },
      {
        title: "Reverse the price chain",
        text: "Recover marked price by dividing selling price by 1−d. A mark-up on cost followed by a discount on marked price must be multiplied, not subtracted.",
      },
    ],
    example: {
      problem:
        "A desk costs ₹1,600. The seller marks it 25% above cost and offers a 12% discount. Find selling price and profit percentage.",
      steps: [
        "Marked price = 1600×1.25 = ₹2,000.",
        "Selling price = 2000×0.88 = ₹1,760.",
        "Profit = ₹160; profit/cost =160/1600 =0.10.",
      ],
      answer: "₹1,760; 10% profit.",
    },
    recall: [
      "Which price is the discount base?",
      "Which price is the profit base?",
      "Reverse a discount using division.",
    ],
    mistake: "25%−12% is not the profit percentage.",
  },
  {
    slug: "work-rates",
    title: "Work rates: add productivity, not completion times",
    subject: "Quantitative Aptitude",
    exams: apt,
    sourceId: "work-motion",
    minutes: 25,
    objective:
      "Combine steady work rates, account for time worked and subtract an opposing rate.",
    concepts: [
      {
        title: "Normalize one job",
        text: "If one worker takes a hours for a fixed job at steady speed, the rate is 1/a jobs per hour. Add compatible rates when both work independently on that same job.",
      },
      {
        title: "Track the remaining job",
        text: "Completed work equals rate × time. If someone leaves, calculate what remains before applying the new rate. A leak or undoing process has a negative rate.",
      },
    ],
    example: {
      problem:
        "A completes a task in 8 hours and B in 24 hours. They work together for 2 hours, then A leaves. How much longer does B need?",
      steps: [
        "Combined rate =1/8+1/24=1/6 job/hour.",
        "In 2 hours they complete 1/3, leaving 2/3.",
        "B needs (2/3)/(1/24)=16 additional hours.",
      ],
      answer: "16 additional hours; 18 hours total.",
    },
    recall: [
      "Rate units are jobs/hour.",
      "Compute remaining work when a worker leaves.",
    ],
    mistake: "Averaging 8 and 24 does not give the combined completion time.",
  },
  {
    slug: "compound-interest",
    title: "Compound interest: rate per period, number of periods",
    subject: "Quantitative Aptitude",
    exams: apt,
    sourceId: "compound",
    minutes: 25,
    objective:
      "Calculate compounding with a declared frequency and distinguish amount from interest.",
    concepts: [
      {
        title: "Period model",
        text: "A = P(1+r/n)^(nt), where r is the nominal annual rate as a decimal, n is periods per year and t is years. Compound interest is A−P.",
      },
      {
        title: "Frequency and comparison",
        text: "Half-yearly compounding halves the nominal annual rate per period and doubles periods per year. Compare with simple interest using the same principal, rate and elapsed time.",
      },
    ],
    example: {
      problem:
        "₹8,000 is invested at a nominal annual 10%, compounded half-yearly, for one year. Find amount and interest.",
      steps: [
        "Rate per period =0.10/2=0.05; periods=2.",
        "Amount =8000×1.05²=₹8,820.",
        "Interest=8820−8000=₹820; simple interest for comparison would be ₹800.",
      ],
      answer: "Amount ₹8,820; compound interest ₹820.",
    },
    recall: [
      "Declare nominal rate and frequency.",
      "Interest is amount minus principal.",
    ],
    mistake:
      "Using 10% for each half-year doubles the intended nominal annual rate.",
  },
  {
    slug: "weighted-averages",
    title: "Averages: totals before shortcuts",
    subject: "Statistics and Data Interpretation",
    exams: apt,
    sourceId: "centre",
    minutes: 25,
    objective:
      "Compute a weighted mean and an ordered median without confusing their meanings.",
    concepts: [
      {
        title: "Mean from totals",
        text: "Mean equals total value divided by total count. Combining groups requires weighting each group mean by its count. Mean of two means works only for equal group sizes.",
      },
      {
        title: "Median and mode",
        text: "Sort observations before taking the middle value, or averaging the two middle values for an even count. Mode means the most frequent value; it need not be unique.",
      },
    ],
    example: {
      problem:
        "A group of 12 has mean 60 and a group of 18 has mean 70. Find combined mean. Separately find the median of 9, 3, 7, 5.",
      steps: [
        "Group totals =720 and 1260.",
        "Combined mean =1980/30=66.",
        "Ordered values:3,5,7,9; median=(5+7)/2=6.",
      ],
      answer: "Combined mean 66; median 6.",
    },
    recall: [
      "Recover totals using mean×count.",
      "Sort before finding a median.",
    ],
    mistake: "The combined mean is not 65 when group sizes differ.",
  },
  {
    slug: "combinations",
    title: "Counting: decide whether order matters",
    subject: "Mathematics",
    exams: apt,
    sourceId: "counting",
    minutes: 25,
    objective:
      "Separate unordered selections from assignments to distinct roles.",
    concepts: [
      {
        title: "Selection versus arrangement",
        text: "Selecting r different items from n without order gives nCr=n!/[r!(n−r)!]. Assigning distinct roles makes order matter and gives nPr=n!/(n−r)!.",
      },
      {
        title: "Restrictions",
        text: "For a required member, include that member first and choose the remainder. Count the complement if it is simpler. State whether repetition is allowed before applying a formula.",
      },
    ],
    example: {
      problem:
        "From 8 students, select a 3-person team containing A. Separately assign captain and secretary from all 8.",
      steps: [
        "With A fixed, select 2 from the other 7:7 C 2=21.",
        "Captain has 8 choices; secretary has 7 after captain is assigned.",
        "Assignments=8×7=56.",
      ],
      answer: "21 teams; 56 role assignments.",
    },
    recall: [
      "Does swapping two chosen people create a new outcome?",
      "Which restrictions are already fixed?",
    ],
    mistake: "Dividing by r! is appropriate only when order is irrelevant.",
  },
  {
    slug: "relative-speed",
    title: "Relative speed: choose a frame and a distance",
    subject: "Quantitative Aptitude",
    exams: apt,
    sourceId: "relative",
    minutes: 25,
    objective:
      "Find meeting and overtaking time with consistent distance and velocity units.",
    concepts: [
      {
        title: "Signed velocities",
        text: "Relative velocity of A with respect to B is vA−vB. In one dimension use signs: opposite directions give a closing speed equal to the sum of speed magnitudes.",
      },
      {
        title: "What must be crossed?",
        text: "Time equals relative distance divided by relative speed at constant velocities. Fully crossing a platform requires train length plus platform length. Convert km/h to m/s with factor 5/18.",
      },
    ],
    example: {
      problem:
        "Two vehicles are 180 km apart, approaching at 50 and 40 km/h. When do they meet? Separately, a 150 m train at 54 km/h passes a 210 m platform.",
      steps: [
        "Closing speed=90 km/h; meeting time=180/90=2 hours.",
        "Train speed=54×5/18=15 m/s.",
        "Full crossing distance=150+210=360 m; time=360/15=24 s.",
      ],
      answer: "2 hours; 24 seconds.",
    },
    recall: [
      "Use a signed reference direction.",
      "Define the entire crossing distance.",
    ],
    mistake:
      "Train length alone does not cover the platform-crossing distance.",
  },
  {
    slug: "electromagnetic-induction",
    title: "Induction: flux change and its opposing response",
    subject: "Electromagnetic Fields",
    exams: tech,
    sourceId: "induction",
    minutes: 25,
    objective:
      "Calculate average induced emf and interpret the sign without confusing flux with flux linkage.",
    concepts: [
      {
        title: "Faraday model",
        text: "Average induced emf is −N ΔΦ/Δt for N identical turns, where Φ is flux through one turn. Flux linkage already includes N; do not multiply by turns twice.",
      },
      {
        title: "Lenz direction",
        text: "The induced response opposes the change in magnetic flux. It does not always oppose the existing field: a decreasing positive flux calls for a response that supports that positive flux.",
      },
    ],
    example: {
      problem:
        "Flux per turn of a 120-turn coil rises uniformly from 2 mWb to 7 mWb in 0.03 s. Find average emf magnitude.",
      steps: [
        "Flux change=(7−2)×10⁻³=0.005 Wb per turn.",
        "Rate of change=0.005/0.03 Wb/s.",
        "Magnitude=120×0.005/0.03=20 V.",
      ],
      answer:
        "20 V; polarity must be referenced to an explicit winding orientation.",
    },
    recall: [
      "Is the given quantity flux or flux linkage?",
      "Oppose the change, not automatically the field.",
    ],
    mistake: "A magnitude alone does not specify terminal polarity.",
  },
  {
    slug: "bihar-river-basins",
    title: "Bihar geography: read a river-basin source critically",
    subject: "Bihar Geography",
    exams: ["bpsc", "upsc"],
    sourceId: "bihar-basins",
    minutes: 20,
    objective:
      "Use the Ganga as a regional divider and distinguish dated reference statistics from current evidence.",
    concepts: [
      {
        title: "Regional orientation",
        text: "The Bihar Water Resources Department describes North and South Bihar relative to the Ganga. Its basin inventory lists Gandak and Kosi among northern basins, and Sone and Punpun among southern basins.",
      },
      {
        title: "Date and reliability",
        text: "The page attributes its tabulated baseline to the Second Bihar State Irrigation Commission (1994). Treat that inventory as dated source material; do not present its infrastructure totals as current. Check map direction independently because the page contains a directional inconsistency.",
      },
    ],
    example: {
      problem:
        "A revision note claims a 1994-baseline embankment total is the latest figure because the web page still exists. Is that sufficient evidence?",
      steps: [
        "Identify the table's stated baseline year.",
        "Separate web availability from data freshness.",
        "Look for a dated updated departmental report before claiming a current total.",
      ],
      answer:
        "No. Keep the baseline date visible and seek an updated primary report.",
    },
    recall: [
      "Name two northern and two southern basin examples.",
      "What date does the table actually cite?",
    ],
    mistake:
      "An official domain does not make every table current or every sentence error-free.",
  },
  {
    slug: "constraint-reasoning",
    title: "Seating puzzles: enumerate, eliminate, verify",
    subject: "Reasoning",
    exams: ["upsc", "bpsc", "ssc", "sbi", "ibps", "cat"],
    sourceId: "logic",
    minutes: 25,
    objective:
      "Translate explicit constraints into candidate arrangements and avoid assuming uniqueness.",
    concepts: [
      {
        title: "Represent the constraints",
        text: "For a line of numbered seats, express 'immediately left' as adjacent positions and 'left of' as a strict inequality. Fix the viewing convention; a line, inward-facing circle and outward-facing circle need different models.",
      },
      {
        title: "Necessity versus possibility",
        text: "List all candidates satisfying every condition. A statement that holds in one candidate is possible; it is necessary only if it holds in every candidate. State when information permits multiple arrangements.",
      },
    ],
    example: {
      problem:
        "Four people A,B,C,D occupy positions 1–4 from the reader's left. A is immediately left of B. C is left of A. D is in position 4. Find the arrangement.",
      steps: [
        "D fixes position 4.",
        "AB can occupy 1–2 or 2–3. AB at 1–2 leaves no seat to A's left for C.",
        "Therefore AB occupies 2–3 and C takes position 1.",
      ],
      answer: "C A B D. This arrangement satisfies every stated condition.",
    },
    recall: [
      "Immediate means adjacent.",
      "Test uniqueness rather than assuming it.",
    ],
    mistake: "'Left of' alone does not mean 'immediately left of'.",
  },
];
type Q = Omit<
  StudyQuestion,
  "version" | "origin" | "keyStatus" | "humanReviewed" | "pyq" | "marks"
>;
export const releaseQuestions: Q[] = [
  {
    id: "trade-1",
    topicId: "profit-discount",
    sourceId: "trade",
    type: "mcq",
    stem: "An item costs ₹900, is marked at ₹1,200, then discounted by 10%. What is the profit percentage?",
    options: ["10%", "20%", "25%", "30%"],
    answer: "1",
    explanation: "SP=1200×0.9=1080. Profit=180 on cost 900, so 20%.",
  },
  {
    id: "trade-2",
    topicId: "profit-discount",
    sourceId: "trade",
    type: "nat",
    stem: "After a 15% discount an item's selling price is ₹1,700. Enter its marked price in rupees.",
    answer: { min: 2000, max: 2000 },
    explanation: "MP=1700/0.85=2000.",
  },
  {
    id: "trade-3",
    topicId: "profit-discount",
    sourceId: "trade",
    type: "msq",
    stem: "Select the correct price-base statements.",
    options: [
      "Discount percentage uses marked price as its base.",
      "Profit percentage uses selling price as its base.",
      "A 25% mark-up and a 20% discount on marked price restore cost.",
      "A 20% profit guarantees a 20% margin on selling price.",
    ],
    answer: [0, 2],
    explanation: "1.25×0.8=1. Profit/cost differs from profit/selling-price.",
  },
  {
    id: "trade-4",
    topicId: "profit-discount",
    sourceId: "trade",
    type: "nat",
    stem: "An article sells at ₹720 at a 10% loss on cost. Enter its cost in rupees.",
    answer: { min: 800, max: 800 },
    explanation: "720=0.9×CP, so CP=800.",
  },
  {
    id: "work-1",
    topicId: "work-rates",
    sourceId: "work-motion",
    type: "nat",
    stem: "A and B independently finish the same job in 10 and 15 hours at constant rates. How many hours do they need together?",
    answer: { min: 6, max: 6 },
    explanation: "1/10+1/15=1/6 job/hour, so 6 hours.",
  },
  {
    id: "work-2",
    topicId: "work-rates",
    sourceId: "work-motion",
    type: "nat",
    stem: "A pipe fills a tank in 6 hours; a leak empties a full tank in 18 hours, each at a constant rate. Starting empty with both active, how many hours to fill?",
    answer: { min: 9, max: 9 },
    explanation: "Net filling rate=1/6−1/18=1/9 tank/hour.",
  },
  {
    id: "work-3",
    topicId: "work-rates",
    sourceId: "work-motion",
    type: "mcq",
    stem: "A steady worker completes 3/8 of a job in 6 hours. How long for the entire job at the same rate?",
    options: ["12 hours", "16 hours", "18 hours", "24 hours"],
    answer: "1",
    explanation: "Rate=(3/8)/6=1/16 job/hour.",
  },
  {
    id: "work-4",
    topicId: "work-rates",
    sourceId: "work-motion",
    type: "nat",
    stem: "A takes 12 hours and B takes 24 hours for a job. They work together for 4 hours, then B leaves. How many additional hours must A work?",
    answer: { min: 6, max: 6 },
    explanation:
      "Combined rate 1/8; four hours completes 1/2. A needs(1/2)×12=6 more hours.",
  },
  {
    id: "compound-1",
    topicId: "compound-interest",
    sourceId: "compound",
    type: "nat",
    stem: "₹5,000 compounds annually at 20% for 2 years. Enter the final amount in rupees.",
    answer: { min: 7200, max: 7200 },
    explanation: "5000×1.2²=7200.",
  },
  {
    id: "compound-2",
    topicId: "compound-interest",
    sourceId: "compound",
    type: "nat",
    stem: "₹10,000 earns nominal annual 8%, compounded half-yearly, for one year. Enter compound interest in rupees.",
    answer: { min: 816, max: 816 },
    explanation: "10000×1.04²−10000=816.",
  },
  {
    id: "compound-3",
    topicId: "compound-interest",
    sourceId: "compound",
    type: "mcq",
    stem: "At 10% annually for 2 years on ₹2,000, how much more interest does annual compounding earn than simple interest?",
    options: ["₹10", "₹20", "₹40", "₹200"],
    answer: "1",
    explanation: "CI=420, SI=400, difference 20.",
  },
  {
    id: "compound-4",
    topicId: "compound-interest",
    sourceId: "compound",
    type: "msq",
    stem: "A nominal annual 12% rate is compounded quarterly for 2 years. Select the correct parameters.",
    options: ["3% per period", "8 periods", "12% per period", "2 periods"],
    answer: [0, 1],
    explanation: "12%/4=3%;4×2=8 periods.",
  },
  {
    id: "average-1",
    topicId: "weighted-averages",
    sourceId: "centre",
    type: "nat",
    stem: "10 observations have mean 20 and 30 observations have mean 28. Enter the combined mean.",
    answer: { min: 26, max: 26 },
    explanation: "(10×20+30×28)/40=26.",
  },
  {
    id: "average-2",
    topicId: "weighted-averages",
    sourceId: "centre",
    type: "nat",
    stem: "Enter the median of 12, 4, 8, 10, 6, 20.",
    answer: { min: 9, max: 9 },
    explanation: "Sorted:4,6,8,10,12,20. Median=(8+10)/2=9.",
  },
  {
    id: "average-3",
    topicId: "weighted-averages",
    sourceId: "centre",
    type: "mcq",
    stem: "Five values have mean 18. A sixth value 30 is appended. What is the new mean?",
    options: ["19", "20", "21", "24"],
    answer: "1",
    explanation: "Old total 90; new total 120 across 6 values gives 20.",
  },
  {
    id: "average-4",
    topicId: "weighted-averages",
    sourceId: "centre",
    type: "msq",
    stem: "For the data 2,2,5,8,8, which are true?",
    options: [
      "Median is 5",
      "There are two modes:2 and 8",
      "Mean is 5",
      "Median must occur most often",
    ],
    answer: [0, 1, 2],
    explanation: "Sum 25/count 5=5; ordered middle 5;2 and 8 each occur twice.",
  },
  {
    id: "counting-1",
    topicId: "combinations",
    sourceId: "counting",
    type: "nat",
    stem: "How many unordered 2-person teams can be selected from 9 people?",
    answer: { min: 36, max: 36 },
    explanation: "9C2=9×8/2=36.",
  },
  {
    id: "counting-2",
    topicId: "combinations",
    sourceId: "counting",
    type: "nat",
    stem: "How many ways can president and secretary be assigned to two distinct people from 7?",
    answer: { min: 42, max: 42 },
    explanation: "7 choices for president and 6 for secretary gives 42.",
  },
  {
    id: "counting-3",
    topicId: "combinations",
    sourceId: "counting",
    type: "nat",
    stem: "A 3-person team is chosen from 6 people. A specified person must be included. How many teams?",
    answer: { min: 10, max: 10 },
    explanation: "Fix that person; choose 2 from remaining 5:5 C 2=10.",
  },
  {
    id: "counting-4",
    topicId: "combinations",
    sourceId: "counting",
    type: "mcq",
    stem: "A team has no assigned roles. Which change creates a new team?",
    options: [
      "Listing the same names in a different order",
      "Replacing one selected member with an unselected person",
      "Writing the names in capitals",
      "Reading the list backwards",
    ],
    answer: "1",
    explanation:
      "Membership, rather than listing order, defines this unordered selection.",
  },
  {
    id: "relative-1",
    topicId: "relative-speed",
    sourceId: "relative",
    type: "nat",
    stem: "Two cyclists start 84 km apart, approach each other at constant 12 and 16 km/h, and start together. Enter meeting time in hours.",
    answer: { min: 3, max: 3 },
    explanation: "Closing speed 28 km/h;84/28=3 hours.",
  },
  {
    id: "relative-2",
    topicId: "relative-speed",
    sourceId: "relative",
    type: "nat",
    stem: "A 180 m train travels at 72 km/h past a stationary pole. Enter full passing time in seconds.",
    answer: { min: 9, max: 9 },
    explanation: "72 km/h=20 m/s;180/20=9 seconds.",
  },
  {
    id: "relative-3",
    topicId: "relative-speed",
    sourceId: "relative",
    type: "nat",
    stem: "A 120 m train at 54 km/h completely crosses a 180 m platform. Enter time in seconds.",
    answer: { min: 20, max: 20 },
    explanation: "Total distance 300 m; speed 15 m/s; time 20 s.",
  },
  {
    id: "relative-4",
    topicId: "relative-speed",
    sourceId: "relative",
    type: "mcq",
    stem: "A moves east at 15 m/s and B east at 9 m/s. What is A's velocity relative to B?",
    options: ["24 m/s east", "6 m/s east", "6 m/s west", "24 m/s west"],
    answer: "1",
    explanation: "Taking east positive,15−9=+6 m/s.",
  },
  {
    id: "induction-1",
    topicId: "electromagnetic-induction",
    sourceId: "induction",
    type: "nat",
    stem: "A 100-turn coil's flux per turn changes by 0.006 Wb in 0.02 seconds. Enter average emf magnitude in volts.",
    answer: { min: 30, max: 30 },
    explanation: "N|ΔΦ|/Δt=100×0.006/0.02=30V.",
  },
  {
    id: "induction-2",
    topicId: "electromagnetic-induction",
    sourceId: "induction",
    type: "nat",
    stem: "Flux linkage of a coil changes by 0.8 Wb-turn in 0.04 seconds. Enter average emf magnitude in volts.",
    answer: { min: 20, max: 20 },
    explanation: "Flux linkage already contains turns.0.8/0.04=20 V.",
  },
  {
    id: "induction-3",
    topicId: "electromagnetic-induction",
    sourceId: "induction",
    type: "mcq",
    stem: "Positive external flux through a conducting loop is decreasing. Which direction must the induced magnetic response have relative to that positive flux?",
    options: [
      "Support the positive flux",
      "Always point against the positive flux",
      "Always be zero",
      "Cannot oppose a change",
    ],
    answer: "0",
    explanation:
      "Lenz's law opposes the decrease, so the induced response supports the original positive direction.",
  },
  {
    id: "induction-4",
    topicId: "electromagnetic-induction",
    sourceId: "induction",
    type: "msq",
    stem: "For a stationary coil with flux per turn changing uniformly, select correct scaling claims.",
    options: [
      "Double turns at fixed flux change and time doubles emf magnitude",
      "Halving the time for the same flux change doubles average emf magnitude",
      "Constant flux necessarily produces a nonzero induced emf",
      "Turn count must be multiplied twice when given flux linkage",
    ],
    answer: [0, 1],
    explanation:
      "Magnitude=N|ΔΦ|/Δt. Constant flux has zero flux-induced emf in this model.",
  },
  {
    id: "bihar-basins-1",
    topicId: "bihar-river-basins",
    sourceId: "bihar-basins",
    type: "mcq",
    stem: "Which pair belongs to the northern basin examples listed in the Bihar departmental source?",
    options: [
      "Gandak and Kosi",
      "Sone and Punpun",
      "Punpun and Kosi",
      "Sone and Gandak",
    ],
    answer: "0",
    explanation: "The source lists Gandak and Kosi in its northern group.",
  },
  {
    id: "bihar-basins-2",
    topicId: "bihar-river-basins",
    sourceId: "bihar-basins",
    type: "mcq",
    stem: "What is the defensible way to cite an infrastructure total explicitly based on a 1994 report?",
    options: [
      "Call it the current total",
      "Retain 1994 as the baseline and seek an updated report",
      "Remove the date",
      "Assume the page was remeasured today",
    ],
    answer: "1",
    explanation:
      "A page's availability does not establish the observation date.",
  },
  {
    id: "bihar-basins-3",
    topicId: "bihar-river-basins",
    sourceId: "bihar-basins",
    type: "msq",
    stem: "Select the southern basin examples from the departmental inventory.",
    options: ["Sone", "Punpun", "Gandak", "Kosi"],
    answer: [0, 1],
    explanation: "Sone and Punpun are listed in the southern group.",
  },
  {
    id: "bihar-basins-4",
    topicId: "bihar-river-basins",
    sourceId: "bihar-basins",
    type: "mcq",
    stem: "An official web page contains a directional inconsistency. What should a study note do?",
    options: [
      "Memorise both directions",
      "Ignore all official sources forever",
      "Flag the discrepancy and compare an authoritative map",
      "Choose the first direction at random",
    ],
    answer: "2",
    explanation:
      "Source criticism requires corroboration when evidence is inconsistent.",
  },
  {
    id: "logic-1",
    topicId: "constraint-reasoning",
    sourceId: "logic",
    type: "mcq",
    stem: "Four seats are numbered 1–4 from the reader's left. A is immediately left of B; C is left of A; D occupies 4. Who occupies 2?",
    options: ["A", "B", "C", "D"],
    answer: "0",
    explanation: "Only C,A,B,D satisfies all conditions, so A is in 2.",
  },
  {
    id: "logic-2",
    topicId: "constraint-reasoning",
    sourceId: "logic",
    type: "mcq",
    stem: "Three seats are numbered 1–3 from the reader's left. A is somewhere left of B, with no other constraint. Which statement must hold?",
    options: [
      "A occupies 1",
      "B occupies 3",
      "A does not occupy 3",
      "C occupies 2",
    ],
    answer: "2",
    explanation:
      "Valid orders are ABC,ACB,CAB. A never occupies 3, but its exact seat is not fixed.",
  },
  {
    id: "logic-3",
    topicId: "constraint-reasoning",
    sourceId: "logic",
    type: "nat",
    stem: "Three people A,B,C occupy three numbered seats from the reader's left. A must be somewhere left of B. How many arrangements satisfy the condition?",
    answer: { min: 3, max: 3 },
    explanation: "ABC,ACB,CAB are exactly the three satisfying permutations.",
  },
  {
    id: "logic-4",
    topicId: "constraint-reasoning",
    sourceId: "logic",
    type: "msq",
    stem: "A puzzle admits two valid arrangements. Select sound statements.",
    options: [
      "A fact true in both arrangements is necessary",
      "A fact true in only one arrangement is necessary",
      "A fact true in one arrangement is possible",
      "A single satisfying arrangement proves uniqueness",
    ],
    answer: [0, 2],
    explanation:
      "Necessity quantifies over every valid arrangement; possibility requires at least one.",
  },
];
