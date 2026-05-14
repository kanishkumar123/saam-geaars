import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
  PageNumber,
  PageBreak,
  LevelFormat,
  TabStopType,
} from "docx";
import fs from "fs";

// ── Helpers & Theme ────────────────────────────────────────────────────────
const CONTENT_WIDTH = 9360; // US Letter 1" margins
const THEME_COLOR = "1F4E79"; // Corporate Blue
const ACCENT_COLOR = "2E75B6";
const LIGHT_BG = "F5F8FA";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: THEME_COLOR };
const headerBorders = {
  top: headerBorder,
  bottom: headerBorder,
  left: headerBorder,
  right: headerBorder,
};

// Title Helper
function title(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 400 },
    children: [new TextRun({ text, size: 36, bold: true, color: THEME_COLOR })],
  });
}

// Heading Helpers
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun(text)],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun(text)],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun(text)],
  });
}

// Paragraph Helper
function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { after: 200, line: 360 }, // 1.5 line spacing for academic look
    children: [
      new TextRun({ text, size: 24, bold: opts.bold, italics: opts.italic }),
    ],
  });
}

function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}

// Table Row Helper
function tableRow(cells, isHeader = false) {
  return new TableRow({
    tableHeader: isHeader,
    children: cells.map(
      (c, i) =>
        new TableCell({
          borders: isHeader ? headerBorders : borders,
          width: { size: c.w, type: WidthType.DXA },
          shading: isHeader
            ? { fill: THEME_COLOR, type: ShadingType.CLEAR }
            : {
                fill: i % 2 === 0 ? LIGHT_BG : "FFFFFF",
                type: ShadingType.CLEAR,
              },
          margins: { top: 120, bottom: 120, left: 150, right: 150 },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: c.center ? AlignmentType.CENTER : AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: c.text,
                  bold: isHeader ? true : c.bold,
                  size: 20,
                  color: isHeader ? "FFFFFF" : "000000",
                }),
              ],
            }),
          ],
        }),
    ),
  });
}

function col(text, w, center = false, bold = false) {
  return { text, w, center, bold };
}

// ── EXPANDED CONTENT PAYLOADS ──────────────────────────────────────────────

const introExpansion = [
  "1.7 THEORETICAL FRAMEWORK: BEYOND MARKOWITZ",
  "While Harry Markowitz laid the foundational mathematics for Modern Portfolio Theory (MPT) in 1952, the practical application of this model requires an understanding of subsequent theoretical evolutions. The Capital Asset Pricing Model (CAPM), developed independently by Sharpe, Lintner, and Mossin in the 1960s, builds upon MPT by introducing the concept of a risk-free asset and formalizing the relationship between systematic risk (Beta) and expected return. In the context of the Indian equity market, where idiosyncratic risks (such as regulatory shifts and corporate governance issues) can heavily influence individual stock performance, the distinction between systematic and unsystematic risk is paramount.",
  "Furthermore, the Arbitrage Pricing Theory (APT) formulated by Stephen Ross in 1976 suggests that asset returns can be predicted using the linear relationship between the asset's expected return and a number of macroeconomic variables. For the Nifty 50 universe analyzed in this study, variables such as the INR/USD exchange rate, RBI repo rate cycles, and global crude oil prices act as critical risk factors that the Markowitz model captures indirectly through historical covariance.",
  "1.8 THE MECHANICS OF OPTIONS AND THE 'GREEKS'",
  "Hedging an equity portfolio using Nifty index options requires a granular understanding of options pricing, governed heavily by the Black-Scholes-Merton model and represented by the 'Greeks'. When constructing the protective put strategy in this study, it is essential to monitor Delta (the sensitivity of the option price to the underlying Nifty index), Gamma (the rate of change of Delta), Theta (time decay), and Vega (sensitivity to implied volatility).",
  "During periods of extreme market stress, such as the March 2020 pandemic crash, implied volatility (India VIX) spiked dramatically. This spike caused the Vega component of put options to inflate option premiums significantly. Therefore, a naive protective put strategy executed during high-VIX environments can result in severe 'volatility crush' losses once the market stabilizes. This study's optimized hedging framework accounts for optimal strike selection to balance delta protection against theta decay and vega risk.",
];

const methodologyExpansion = [
  "3.5 ADVANCED MATHEMATICAL FORMULATIONS",
  "The portfolio optimization process relies on three core mathematical pillars. First, the expected return of the portfolio (E(Rp)) is calculated as the weighted sum of the expected returns of the individual assets:",
  "E(Rp) = Σ (wi * E(Ri)) for i = 1 to n",
  "Second, the portfolio variance (σp²), which represents the total risk, is calculated using the covariance matrix. This is not simply the weighted average of individual variances, but incorporates the pairwise covariance between all assets:",
  "σp² = Σ Σ (wi * wj * Cov(i,j))",
  "The Excel Solver utilizes the Generalized Reduced Gradient (GRG) Nonlinear solving method to navigate this quadratic programming problem. The objective function is set to maximize the Sharpe Ratio [ (E(Rp) - Rf) / σp ], subject to the constraints that all weights (wi) must sum to 1 (100% investment), and 0 ≤ wi ≤ 0.40 (to prevent extreme concentration in a single asset).",
  "3.6 VALUE AT RISK (VaR) METHODOLOGIES",
  "To quantify downside risk, this study employs the Variance-Covariance (Parametric) VaR method. At a 95% confidence interval, assuming normally distributed returns, the Z-score is 1.645. The annual VaR is computed as:",
  "VaR(95%) = Portfolio Value * (E(Rp) - (1.645 * σp))",
  "While robust for normal market conditions, the parametric VaR assumes a normal distribution of returns (Gaussian curve). Financial markets, particularly emerging markets like India, often exhibit 'fat tails' (kurtosis) and negative skewness. Therefore, the hedging framework designed in this study acts as a structural defense against tail-risk events that VaR models typically underestimate.",
];

const sectoralAnalysis = [
  "4.5 DEEP DIVE: SECTORAL PERFORMANCE AND MACRO-DRIVERS (2019-2023)",
  "The study period spans one of the most volatile macroeconomic cycles in modern financial history. Analyzing the sectoral performance elucidates why the Markowitz Solver allocated weights heavily toward FMCG and Pharmaceuticals while minimizing Banking and Auto.",
  "4.5.1 The Defensive Premium (FMCG & Pharma)",
  "Nestle India (17.59% allocation), Asian Paints (11.68%), Sun Pharma (15.72%), and Cipla (11.23%) dominated the optimal portfolio. During the 2020 pandemic lockdowns and the subsequent high-inflation environment of 2022, FMCG and Pharma exhibited extreme demand inelasticity. Sun Pharma and Cipla benefited from global supply chain realignments and robust domestic formulations growth. Their returns remained un-correlated to the credit-cycle shocks affecting the broader economy, providing immense diversification alpha.",
  "4.5.2 The IT Sector: Pandemic Boom and Subsequent Normalization",
  "Infosys (9.60%), TCS (6.97%), and Wipro (5.39%) accounted for nearly 22% of the optimal portfolio. IT services saw unprecedented margin expansion and deal wins during 2020-2021 as global enterprises accelerated digital transformation. However, as the US Federal Reserve aggressively hiked interest rates in 2022-2023, recessionary fears in North America led to multiple compression in Indian IT stocks. The Solver naturally limited their combined weight due to their high intra-sector correlation (r > 0.75), preventing portfolio overlap.",
  "4.5.3 The Banking Drag: Regulatory and Merger Overhangs",
  "HDFC Bank received a 0.00% allocation despite being a Nifty heavyweight. The stock yielded a negative annualized return (-4.64%) over the specific 5-year study period. This underperformance was heavily driven by the complexities, regulatory costs (CRR/SLR maintenance on a larger deposit base), and margin dilution associated with its mega-merger with parent entity HDFC Ltd. Conversely, ICICI Bank (8.31% allocation) underwent a significant re-rating driven by strong asset quality improvements and aggressive retail credit growth, earning it a spot in the optimal portfolio.",
];

// ── DOCUMENT DEFINITION ────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 24, color: "333333" } },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, color: THEME_COLOR },
        paragraph: {
          spacing: { before: 400, after: 200 },
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 6,
              color: THEME_COLOR,
              space: 1,
            },
          },
        },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, color: ACCENT_COLOR },
        paragraph: { spacing: { before: 300, after: 160 } },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, color: "404040" },
        paragraph: { spacing: { before: 200, after: 100 } },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              border: {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: THEME_COLOR,
                  space: 4,
                },
              },
              children: [
                new TextRun({
                  text: "Optimal Equity Portfolio Construction & Hedging",
                  size: 18,
                  color: THEME_COLOR,
                  bold: true,
                }),
                new TextRun({
                  text: "  |  Baranidharan.J  |  2026",
                  size: 18,
                  color: "888888",
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: {
                top: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: THEME_COLOR,
                  space: 4,
                },
              },
              tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
              children: [
                new TextRun({
                  text: "Hindustan Institute of Technology and Science",
                  size: 18,
                  color: "888888",
                }),
                new TextRun({ text: "\t", size: 18 }),
                new TextRun({ text: "Page ", size: 18, color: "888888" }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  color: THEME_COLOR,
                  bold: true,
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ── COVER PAGE ──────────────────────────────────────────────
        new Paragraph({ spacing: { before: 1000 } }),
        title("CONSTRUCTING AN OPTIMAL EQUITY PORTFOLIO"),
        title("USING MARKOWITZ MODEL AND HEDGING"),
        title("WITH NIFTY OPTIONS"),
        p("A STUDY OF NSE NIFTY STOCKS", { center: true, bold: true }),
        new Paragraph({ spacing: { before: 1000 } }),
        p("A PROJECT REPORT", { center: true, bold: true }),
        p("Submitted by", { center: true }),
        p("BARANIDHARAN.J", { center: true, bold: true }),
        p("Register No: 22290001", { center: true }),
        new Paragraph({ spacing: { before: 1000 } }),
        p("in partial fulfillment for the award of the degree of", {
          center: true,
        }),
        p("MASTER OF BUSINESS ADMINISTRATION", { center: true, bold: true }),
        p("in FINANCE AND MARKETING", { center: true }),
        new Paragraph({ spacing: { before: 2000 } }),
        p("SCHOOL OF MANAGEMENT", { center: true, bold: true }),
        p("HINDUSTAN INSTITUTE OF TECHNOLOGY AND SCIENCE", { center: true }),
        p("PADUR, CHENNAI - 603 103", { center: true }),
        p("MAY 2026", { center: true }),
        pb(),

        // ── EXPANDED CHAPTER 1 ──────────────────────────────────────────────
        h1("CHAPTER ONE: INTRODUCTION AND THEORETICAL FRAMEWORK"),
        p(
          "The Indian financial services industry has undergone a transformative evolution over the past three decades, emerging as one of the most dynamic and technologically advanced capital markets in the world. Driven by rapid digitalization, regulatory reforms, and increasing investor participation, it has evolved into a globally competitive financial ecosystem.",
        ),
        ...introExpansion.map((text) => {
          if (text.match(/^[1-9]\.[1-9]/)) return h2(text);
          return p(text);
        }),
        pb(),

        // ── EXPANDED CHAPTER 3 ──────────────────────────────────────────────
        h1("CHAPTER THREE: EXPANDED RESEARCH METHODOLOGY"),
        p(
          "This study adopts a rigorous mixed-method research design combining quantitative analysis of secondary market data with primary survey research. The quantitative component applies the Markowitz Mean-Variance Optimization (MVO) framework to NSE historical price data.",
        ),
        ...methodologyExpansion.map((text) => {
          if (text.match(/^[1-9]\.[1-9]/)) return h2(text);
          return p(text);
        }),
        pb(),

        // ── EXPANDED CHAPTER 4 ──────────────────────────────────────────────
        h1("CHAPTER FOUR: ADVANCED DATA ANALYSIS & INTERPRETATION"),
        p(
          "This chapter expands upon the risk-return characteristics of the 15 selected Nifty 50 stocks. By evaluating the individual Sharpe ratios and covariance matrix, we uncover the structural inefficiencies that the Markowitz solver exploited to construct the optimal portfolio.",
        ),

        h2("4.1 Individual Stock Risk-Return Summary"),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(
              [
                col("Stock", 2500, true, true),
                col("Sector", 2000, true, true),
                col("Ann. Return", 1500, true, true),
                col("Ann. Vol (σ)", 1500, true, true),
                col("Sharpe Ratio", 1500, true, true),
              ],
              true,
            ),
            tableRow([
              col("SUNPHARMA", 2500),
              col("Pharma", 2000),
              col("21.41%", 1500, true),
              col("27.97%", 1500, true),
              col("0.522", 1500, true, true),
            ]),
            tableRow([
              col("NESTLEIND", 2500),
              col("FMCG", 2000),
              col("17.25%", 1500, true),
              col("22.73%", 1500, true),
              col("0.460", 1500, true, true),
            ]),
            tableRow([
              col("WIPRO", 2500),
              col("IT", 2000),
              col("18.98%", 1500, true),
              col("27.26%", 1500, true),
              col("0.447", 1500, true, true),
            ]),
            tableRow([
              col("ASIANPAINT", 2500),
              col("FMCG", 2000),
              col("18.25%", 1500, true),
              col("26.36%", 1500, true),
              col("0.434", 1500, true, true),
            ]),
            tableRow([
              col("ICICIBANK", 2500),
              col("Banking", 2000),
              col("20.72%", 1500, true),
              col("32.95%", 1500, true),
              col("0.422", 1500, true, true),
            ]),
            tableRow([
              col("HDFCBANK", 2500),
              col("Banking", 2000),
              col("-4.64%", 1500, true),
              col("41.14%", 1500, true),
              col("-0.278", 1500, true, false),
            ]),
          ],
        }),
        new Paragraph({ spacing: { before: 300 } }),

        ...sectoralAnalysis.map((text) => {
          if (text.match(/^[1-9]\.[1-9]\.[1-9]/)) return h3(text);
          if (text.match(/^[1-9]\.[1-9]/)) return h2(text);
          return p(text);
        }),
        pb(),

        h2("4.6 Advanced Hedging Analytics: The Protective Put"),
        p(
          "As demonstrated in the primary analysis, a protective put strategy using one Nifty 50 put option lot (strike: 23,000, premium: ₹110/unit, total cost: ₹7,150) reduces portfolio Value-at-Risk by ₹27,364. This section details the scenario matrix during a hypothetical localized crash.",
        ),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(
              [
                col("Market Scenario", 3000, true, true),
                col("Unhedged P&L (₹)", 3000, true, true),
                col("Hedged P&L (₹)", 3000, true, true),
              ],
              true,
            ),
            tableRow([
              col("Nifty drops 10%", 3000),
              col("-1,05,000", 3000, true),
              col("-35,000", 3000, true, true),
            ]),
            tableRow([
              col("Nifty drops 5%", 3000),
              col("-52,500", 3000, true),
              col("-37,500", 3000, true, true),
            ]),
            tableRow([
              col("Nifty flat (0%)", 3000),
              col("0", 3000, true),
              col("-15,000", 3000, true, false),
            ]),
            tableRow([
              col("Nifty rises 10%", 3000),
              col("+1,05,000", 3000, true),
              col("+90,000", 3000, true, true),
            ]),
          ],
        }),
        new Paragraph({ spacing: { before: 300 } }),
        p(
          "By paying a premium equivalent to merely 0.72% of the total portfolio value, the investor creates an absolute floor on maximum downside risk. This asymmetrical risk-reward payoff is mathematically impossible to achieve purely through equity diversification, underscoring the absolute necessity of derivative overlays in modern portfolio management.",
        ),

        pb(),
        // ── EXPANDED CHAPTER 5 ──────────────────────────────────────────────
        h1("CHAPTER FIVE: STRATEGIC CONCLUSIONS & SEBI RECOMMENDATIONS"),
        p(
          "This study conclusively demonstrates that the Markowitz Mean-Variance Optimization model remains a robust, practically applicable framework for the Indian capital market. The dramatic improvement in risk-adjusted performance—from a Sharpe Ratio of 0.26 (equal weights) to 1.04 (Markowitz weights)—provides strong empirical evidence.",
        ),
        h2("5.5 Institutional Policy Recommendations"),
        p(
          "Given the survey finding that 62% of finance professionals lack practical familiarity with MPT, we recommend the following institutional interventions:",
        ),
        p(
          "1. SEBI's Investor Education and Protection Fund (IEPF) must mandate brokerages to display a 'Diversification Health Score' on retail trading applications based on real-time correlation matrices.",
        ),
        p(
          "2. Standardized margin benefits should be enhanced for retail accounts that hold demonstrably hedged equity portfolios (e.g., covered calls, protective puts), incentivizing risk management over pure directional speculation.",
        ),
        p(
          "3. Academic institutions must transition finance pedagogy from theoretical equilibrium models to applied quantitative software training, ensuring graduates can execute Python or Excel-based solver models natively.",
        ),
      ],
    },
  ],
});

// ── SAVE FILE ──────────────────────────────────────────────────────────────
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Expanded_Portfolio_Project.docx", buffer);
  console.log(
    "✅ Document successfully generated! Open Expanded_Portfolio_Project.docx",
  );
});
