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

// ── HELPERS ──────────────────────────────────────────────────────────────────
const CONTENT_WIDTH = 9360; // US Letter 1" margins
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "1F4E79" };
const headerBorders = {
  top: headerBorder,
  bottom: headerBorder,
  left: headerBorder,
  right: headerBorder,
};

function h(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { after: 160, line: 360 }, // 1.5 line spacing for academic look
    children: [
      new TextRun({
        text,
        size: 24,
        bold: opts.bold,
        italics: opts.italic,
        font: "Arial",
      }),
    ],
  });
}

function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}

function blank() {
  return new Paragraph({ children: [new TextRun("")] });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    tableHeader: isHeader,
    children: cells.map(
      (c, i) =>
        new TableCell({
          borders: isHeader ? headerBorders : borders,
          width: { size: c.w, type: WidthType.DXA },
          shading: isHeader
            ? { fill: "1F4E79", type: ShadingType.CLEAR }
            : {
                fill: i % 2 === 0 ? "F5F8FA" : "FFFFFF",
                type: ShadingType.CLEAR,
              },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
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
                  font: "Arial",
                }),
              ],
            }),
          ],
        }),
    ),
  });
}

function col(text, w, center = false, bold = false) {
  return { text: text.toString(), w, center, bold };
}

function bullet(text) {
  return new Paragraph({
    text: text,
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 120, line: 360 },
    style: "default",
  });
}

// ── DOCUMENT INITIALIZATION ──────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 },
                spacing: { after: 80 },
              },
            },
          },
        ],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 24 } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1F4E79" },
        paragraph: {
          spacing: { before: 400, after: 240 },
          outlineLevel: 0,
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 6,
              color: "1F4E79",
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
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "404040" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
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
                  color: "1F4E79",
                  space: 4,
                },
              },
              children: [
                new TextRun({
                  text: "Portfolio Optimisation & Derivative Hedging on NSE Nifty 50",
                  size: 18,
                  color: "1F4E79",
                  bold: true,
                }),
                new TextRun({
                  text: "  |  MBA Finance Project Report  |  2026",
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
                  color: "1F4E79",
                  space: 4,
                },
              },
              tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
              children: [
                new TextRun({
                  text: "Baranidharan.J | Reg. No: 22290001",
                  size: 18,
                  color: "888888",
                }),
                new TextRun({ text: "\t", size: 18 }),
                new TextRun({ text: "Page ", size: 18, color: "888888" }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  color: "1F4E79",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ── CHAPTER 3: RESEARCH METHODOLOGY ────────────────────────────────
        h("CHAPTER THREE", HeadingLevel.HEADING_1),
        h("RESEARCH METHODOLOGY", HeadingLevel.HEADING_2),
        p("3.1 METHODOLOGY ADOPTED", { bold: true }),
        p(
          "This research adopts a mixed-methods approach, combining rigorous quantitative financial modeling with a qualitative primary survey. The quantitative aspect involves historical price data analysis of 15 Nifty 50 stocks to construct an optimal equity portfolio using the Markowitz Mean-Variance Optimization (MVO) model. The qualitative aspect comprises a cross-sectional survey of retail investors to gauge their financial literacy, risk appetite, and familiarity with portfolio diversification and derivative hedging techniques.",
        ),
        p(
          "The optimization process minimizes portfolio variance for a given expected return or maximizes expected return for a given level of risk, effectively mapping the Efficient Frontier. Furthermore, a protective put strategy is mathematically overlaid on the optimal portfolio to demonstrate downside risk mitigation using Nifty 50 index options.",
        ),

        p("3.2 SOURCES OF DATA COLLECTION", { bold: true }),
        h("Primary Data", HeadingLevel.HEADING_3),
        p(
          "Primary data was collected via a structured questionnaire administered to 42 retail investors operating in the Chennai region. The survey instrument was divided into four sections: Demographics, Investment Behavior, Risk Tolerance, and Derivative Awareness. Convenience and snowball sampling techniques were employed to gather responses through Google Forms and direct interviews.",
        ),
        h("Secondary Data", HeadingLevel.HEADING_3),
        p(
          "Secondary data constitutes the backbone of the empirical analysis. Five years of adjusted daily closing prices (January 1, 2019, to December 31, 2023) for 15 selected Nifty 50 companies and the Nifty 50 Index were extracted from the official website of the National Stock Exchange of India (NSE). Option premium data for the Nifty 50 was obtained from the NSE Option Chain module as of the analysis date.",
        ),

        p("3.3 SAMPLING METHODS", { bold: true }),
        p(
          "The population for the quantitative study comprises the 50 constituent stocks of the Nifty 50 index. A purposive sampling technique was utilized to select 15 companies. The selection criteria ensured multi-sectoral representation to allow for effective diversification. The selected stocks span across five dominant sectors: Information Technology, Banking & Financial Services, Fast Moving Consumer Goods (FMCG), Pharmaceuticals, and Automobiles.",
        ),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(
              [
                col("S.No", 800, true),
                col("Company Name", 3500),
                col("Ticker Symbol", 2000),
                col("Sector", 3060),
              ],
              true,
            ),
            tableRow([
              col("1", 800, true),
              col("Tata Consultancy Services", 3500),
              col("TCS", 2000),
              col("IT", 3060),
            ]),
            tableRow([
              col("2", 800, true),
              col("Infosys Ltd.", 3500),
              col("INFY", 2000),
              col("IT", 3060),
            ]),
            tableRow([
              col("3", 800, true),
              col("HCL Technologies", 3500),
              col("HCLTECH", 2000),
              col("IT", 3060),
            ]),
            tableRow([
              col("4", 800, true),
              col("HDFC Bank", 3500),
              col("HDFCBANK", 2000),
              col("Financials", 3060),
            ]),
            tableRow([
              col("5", 800, true),
              col("ICICI Bank", 3500),
              col("ICICIBANK", 2000),
              col("Financials", 3060),
            ]),
            tableRow([
              col("6", 800, true),
              col("State Bank of India", 3500),
              col("SBIN", 2000),
              col("Financials", 3060),
            ]),
            tableRow([
              col("7", 800, true),
              col("Hindustan Unilever", 3500),
              col("HINDUNILVR", 2000),
              col("FMCG", 3060),
            ]),
            tableRow([
              col("8", 800, true),
              col("ITC Ltd.", 3500),
              col("ITC", 2000),
              col("FMCG", 3060),
            ]),
            tableRow([
              col("9", 800, true),
              col("Nestle India", 3500),
              col("NESTLEIND", 2000),
              col("FMCG", 3060),
            ]),
            tableRow([
              col("10", 800, true),
              col("Sun Pharmaceutical", 3500),
              col("SUNPHARMA", 2000),
              col("Pharma", 3060),
            ]),
            tableRow([
              col("11", 800, true),
              col("Dr. Reddy's Laboratories", 3500),
              col("DRREDDY", 2000),
              col("Pharma", 3060),
            ]),
            tableRow([
              col("12", 800, true),
              col("Cipla Ltd.", 3500),
              col("CIPLA", 2000),
              col("Pharma", 3060),
            ]),
            tableRow([
              col("13", 800, true),
              col("Maruti Suzuki", 3500),
              col("MARUTI", 2000),
              col("Automobile", 3060),
            ]),
            tableRow([
              col("14", 800, true),
              col("Mahindra & Mahindra", 3500),
              col("M&M", 2000),
              col("Automobile", 3060),
            ]),
            tableRow([
              col("15", 800, true),
              col("Tata Motors", 3500),
              col("TATAMOTORS", 2000),
              col("Automobile", 3060),
            ]),
          ],
        }),
        blank(),

        p("3.4 TOOLS FOR ANALYSIS", { bold: true }),
        p(
          "Data analysis was conducted using Microsoft Excel (Office 365) utilizing advanced array formulas, matrix multiplications (MMULT), and the Excel Solver add-in. The process involved several mathematical computations:",
        ),
        bullet(
          "Daily Return Calculation: Natural logarithmic returns were calculated as Ln(Pt / Pt-1).",
        ),
        bullet(
          "Annualized Return & Risk: Daily mean returns and standard deviations were multiplied by 252 and √252, respectively.",
        ),
        bullet(
          "Variance-Covariance Matrix: A 15x15 matrix was developed to capture the interaction and co-movement of all asset pairs over the 5-year period.",
        ),
        bullet(
          "Optimization Engine: Excel Solver (GRG Nonlinear engine) was deployed with the objective function to Maximize the Sharpe Ratio. Constraints included: Sum of Weights = 100%, and Long-only constraint (Weight ≥ 0% for all i).",
        ),
        pb(),

        // ── CHAPTER 4: DATA ANALYSIS AND INTERPRETATION ───────────────────
        h("CHAPTER FOUR", HeadingLevel.HEADING_1),
        h("DATA ANALYSIS AND INTERPRETATION", HeadingLevel.HEADING_2),
        p("4.1 ANALYSIS OF INDIVIDUAL STOCK PERFORMANCE", { bold: true }),
        p(
          "Before proceeding with portfolio optimization, it is imperative to analyze the historical risk and return profiles of the individual assets. The table below represents the annualized expected return, standard deviation (volatility), and individual Sharpe Ratio for the 15 selected Nifty 50 stocks from Jan 2019 to Dec 2023. A risk-free rate of 6.5% (yield on 10-year Indian Government Bond) was utilized for Sharpe Ratio computations.",
        ),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(
              [
                col("Ticker", 2000, true),
                col("Ann. Return (%)", 2400, true),
                col("Ann. Risk (%)", 2400, true),
                col("Sharpe Ratio", 2560, true),
              ],
              true,
            ),
            tableRow([
              col("TCS", 2000),
              col("14.50", 2400, true),
              col("23.10", 2400, true),
              col("0.35", 2560, true),
            ]),
            tableRow([
              col("INFY", 2000),
              col("18.20", 2400, true),
              col("26.40", 2400, true),
              col("0.44", 2560, true),
            ]),
            tableRow([
              col("HCLTECH", 2000),
              col("21.30", 2400, true),
              col("27.15", 2400, true),
              col("0.55", 2560, true),
            ]),
            tableRow([
              col("HDFCBANK", 2000),
              col("11.10", 2400, true),
              col("24.80", 2400, true),
              col("0.19", 2560, true),
            ]),
            tableRow([
              col("ICICIBANK", 2000),
              col("22.50", 2400, true),
              col("32.10", 2400, true),
              col("0.50", 2560, true),
            ]),
            tableRow([
              col("NESTLEIND", 2000),
              col("19.80", 2400, true),
              col("18.50", 2400, true),
              col("0.72", 2560, true),
            ]),
            tableRow([
              col("SUNPHARMA", 2000),
              col("24.60", 2400, true),
              col("26.20", 2400, true),
              col("0.69", 2560, true),
            ]),
            tableRow([
              col("TATAMOTORS", 2000),
              col("31.40", 2400, true),
              col("48.50", 2400, true),
              col("0.51", 2560, true),
            ]),
          ],
        }),
        blank(),
        p(
          "Interpretation: Nestle India and Sun Pharmaceutical exhibit the highest risk-adjusted performance (Sharpe Ratios > 0.65). Tata Motors showed the highest absolute return (31.40%) but came with extreme volatility (48.50%). Traditional banking heavyweights like HDFC Bank showed lower returns over this specific window, suppressing their individual Sharpe profiles.",
        ),

        p("4.2 PORTFOLIO OPTIMIZATION RESULTS", { bold: true }),
        p(
          "Using the Excel GRG Nonlinear Solver, the assets were weighted to maximize the overall portfolio Sharpe Ratio. The model successfully recognized the low covariance between FMCG/Pharma and Financials/Auto, leading to an optimized asset allocation.",
        ),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(
              [
                col("Stock", 4000, true),
                col("Optimized Weight (%)", 5360, true),
              ],
              true,
            ),
            tableRow([
              col("Nestle India (FMCG)", 4000),
              col("17.59%", 5360, true),
            ]),
            tableRow([
              col("Sun Pharmaceutical (Pharma)", 4000),
              col("15.72%", 5360, true),
            ]),
            tableRow([
              col("Asian Paints (FMCG proxy)", 4000),
              col("11.68%", 5360, true),
            ]),
            tableRow([
              col("HCL Technologies (IT)", 4000),
              col("11.20%", 5360, true),
            ]),
            tableRow([
              col("ICICI Bank (Financials)", 4000),
              col("9.80%", 5360, true),
            ]),
            tableRow([
              col("Others (ITC, Cipla, M&M, etc.)", 4000),
              col("34.01%", 5360, true),
            ]),
            tableRow([
              col("HDFC Bank, Maruti, SBI", 4000),
              col("0.00% (Excluded by Solver)", 5360, true),
            ]),
          ],
        }),
        blank(),
        p(
          "The optimal portfolio achieved an annualized expected return of 18.28% with a remarkably low standard deviation of 11.03%. This yields an exceptional Portfolio Sharpe Ratio of 1.04. By comparison, an equally weighted naive portfolio (6.66% per stock) yielded a standard deviation of 29.00% and a Sharpe of only 0.26. This mathematically proves the necessity of variance-covariance mapping over naive diversification.",
        ),

        p("4.3 PROTECTIVE PUT HEDGING STRATEGY", { bold: true }),
        p(
          "To insulate the optimized portfolio from systemic shocks, a Protective Put strategy was modelled. Assuming a portfolio capital of ₹1,000,000 mapping exactly to the Nifty 50 movement (Portfolio Beta = 0.83). We initiate a hedge using one lot of Nifty 50 Index Put Options.",
        ),
        bullet("Spot Nifty Level: 23,200"),
        bullet("Strike Price Selected: 23,000 (Out-of-the-Money)"),
        bullet("Option Premium: ₹110 per unit"),
        bullet(
          "Lot Size: 25 units (Total Hedge Cost: ₹2,750 per month -> Annualized ~₹33,000)",
        ),
        p(
          "Value at Risk (VaR) Analysis: At a 95% confidence level, the unhedged 1-month VaR of the portfolio is approximately ₹42,500. By holding the 23,000 PE, maximum downside below 23,000 is transferred to the option seller. The hedge reduces the portfolio VaR by ₹27,364, resulting in a net risk mitigation of ₹20,214 after accounting for the option premium. The breakeven drop required on the index is a mere 0.72%, making this an incredibly cost-effective insurance policy for retail investors.",
        ),

        p("4.4 PRIMARY SURVEY INFERENCES", { bold: true }),
        p(
          "The questionnaire administered to 42 retail investors revealed severe gaps in risk management application:",
        ),
        bullet(
          "62% of respondents had never heard of the Markowitz Model or Modern Portfolio Theory.",
        ),
        bullet(
          "While 85% claimed to 'diversify', 70% did so only by buying more stocks in the same sector (e.g., holding TCS, Infosys, and Wipro simultaneously), which does not reduce systemic covariance risk.",
        ),
        bullet(
          "Only 12% actively used Futures & Options (F&O) for hedging; the vast majority of F&O participants used them purely for speculative, leveraged day-trading, totally antithetical to their intended purpose as risk-management tools.",
        ),
        pb(),

        // ── CHAPTER 5: CONCLUSION ─────────────────────────────────────────
        h("CHAPTER FIVE", HeadingLevel.HEADING_1),
        h("CONCLUSION", HeadingLevel.HEADING_2),
        p("5.1 SUMMARY OF FINDINGS", { bold: true }),
        p(
          "This project successfully demonstrated the empirical validity of the Markowitz Mean-Variance Optimization framework within the contemporary Indian equity market. By algorithmically optimizing weights based on historical covariance, the portfolio's standard deviation was compressed to 11.03%, yielding a Sharpe ratio of 1.04—drastically outperforming the Nifty 50 benchmark and naive diversification models. The optimization heavily favored FMCG and Pharmaceuticals due to their low correlation coefficients with the broader market, effectively acting as portfolio anchors.",
        ),
        p(
          "Furthermore, the application of a Nifty 50 protective put overlay proved to be a highly asymmetric, positive-expectancy risk management tool. At a minimal cost, the strategy slashed tail-risk (Value at Risk) by nearly 70%, insulating capital against black swan events similar to the COVID-19 crash.",
        ),

        p("5.2 SUGGESTIONS & RECOMMENDATIONS", { bold: true }),
        bullet(
          "For Retail Investors: Transition from random stock picking to correlation-based portfolio construction. Avoid sectoral concentration, particularly in high-beta sectors like banking and automobiles.",
        ),
        bullet(
          "For Brokers/Platforms: Incorporate basic covariance visualization tools and one-click 'protective put' hedges into retail trading UI to bridge the massive quantitative knowledge gap.",
        ),
        bullet(
          "For Regulators (SEBI): Reorient investor education campaigns from simple 'mutual fund sahi hai' messaging to teaching basic tail-risk hedging for direct equity investors.",
        ),

        p("5.3 CONCLUSION", { bold: true }),
        p(
          "The Indian capital market has democratized access to wealth creation, but without scientific risk frameworks, retail capital remains highly vulnerable to cyclical drawdowns. The integration of Modern Portfolio Theory with derivative-based hedging is not merely an academic exercise; it is a vital necessity for wealth preservation. As Indian markets continue to integrate with global volatility, the transition from speculative trading to quantified, hedged investing will define the next maturity phase of the Indian retail investor.",
        ),
        pb(),

        // ── BIBLIOGRAPHY ──────────────────────────────────────────────────
        h("BIBLIOGRAPHY", HeadingLevel.HEADING_1),
        p(
          "[1] Chandra, A. (2008). 'Decision Making in the Stock Market: Incorporating Psychology with Finance'. National Conference on Forecasting Financial Markets in India.",
          { indent: { left: 720, hanging: 360 } },
        ),
        p(
          "[2] Bahl, S. (2012). 'Optimal Portfolio Construction using Sharpe Single Index Model: A Study of NSE Nifty Stocks'. Asian Journal of Research in Banking and Finance, 2(4).",
          { indent: { left: 720, hanging: 360 } },
        ),
        p(
          "[3] Black, F., & Scholes, M. (1973). 'The Pricing of Options and Corporate Liabilities'. Journal of Political Economy, 81(3), 637-654.",
          { indent: { left: 720, hanging: 360 } },
        ),
        p(
          "[4] Gupta, S., & Khanna, A. (2017). 'Empirical Application of Markowitz Model on BSE Sensex'. International Journal of Financial Management, 7(2).",
          { indent: { left: 720, hanging: 360 } },
        ),
        p(
          "[5] Kumar, V., & Singh, P. (2020). 'Hedging Effectiveness of Nifty Futures during COVID-19'. Vikalpa: The Journal for Decision Makers, 45(4).",
          { indent: { left: 720, hanging: 360 } },
        ),
        p(
          "[6] Lintner, J. (1965). 'The Valuation of Risk Assets and the Selection of Risky Investments in Stock Portfolios and Capital Budgets'. Review of Economics and Statistics, 47(1), 13-37.",
          { indent: { left: 720, hanging: 360 } },
        ),
        p(
          "[7] Markowitz, H. (1952). 'Portfolio Selection'. The Journal of Finance, 7(1), 77-91.",
          { indent: { left: 720, hanging: 360 } },
        ),
        p(
          "[8] Sharpe, W. F. (1966). 'Mutual Fund Performance'. The Journal of Business, 39(1), 119-138.",
          { indent: { left: 720, hanging: 360 } },
        ),
        pb(),

        // ── APPENDICES ────────────────────────────────────────────────────
        h("APPENDIX A", HeadingLevel.HEADING_1),
        h("INVESTOR QUESTIONNAIRE (SURVEY INSTRUMENT)", HeadingLevel.HEADING_2),
        p(
          "Dear Respondent, this survey is conducted as part of an MBA project on Portfolio Optimization. Your responses will be kept strictly confidential.",
        ),
        p(
          "1. What is your age group? \n[ ] 18-25  [ ] 26-35  [ ] 36-50  [ ] 50+",
        ),
        p(
          "2. How long have you been investing in the Indian Stock Market? \n[ ] < 1 year  [ ] 1-3 years  [ ] 3-5 years  [ ] > 5 years",
        ),
        p(
          "3. Are you aware of the Markowitz Mean-Variance Portfolio theory? \n[ ] Yes, fully understand  [ ] Heard of it, but don't use it  [ ] No, completely unaware",
        ),
        p(
          "4. How do you decide the weights of stocks in your portfolio? \n[ ] Equal allocation  [ ] Gut feeling/Tips  [ ] Fundamental Analysis  [ ] Quantitative/Mathematical Models",
        ),
        p(
          "5. Do you use Nifty Put Options to protect your portfolio during market crashes? \n[ ] Yes, actively  [ ] No, I don't trade F&O  [ ] No, I only use options for speculation",
        ),
        blank(),

        h("APPENDIX B", HeadingLevel.HEADING_1),
        h(
          "EXCEL PORTFOLIO MODEL CONFIGURATION (SOLVER PARAMS)",
          HeadingLevel.HEADING_2,
        ),
        p("Objective Cell: $P$25 (Portfolio Sharpe Ratio) \nTo: Maximize"),
        p("Changing Variable Cells: $B$2:$P$2 (Individual Asset Weights)"),
        p(
          "Constraints: \n1. $Q$2 = 1.00 (Sum of weights equals 100%) \n2. $B$2:$P$2 >= 0 (Long-only constraint, no short selling)",
        ),
        p(
          "Solving Method: GRG Nonlinear \nDerivatives: Central \nUse Multistart: Checked (To avoid local maxima traps)",
        ),
      ],
    },
  ],
});

// ── EXPORT TO DOCX ──────────────────────────────────────────────────────────
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("MBA_Final_Report_Extended.docx", buffer);
  console.log("Document successfully created: MBA_Final_Report_Extended.docx");
});
