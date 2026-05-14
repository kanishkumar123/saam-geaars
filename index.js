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
  TabStopPosition,
} from "docx";
import fs from "fs";

// ── helpers ──────────────────────────────────────────────────────────────────
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
    spacing: { after: 160 },
    children: [
      new TextRun({ text, size: 24, bold: opts.bold, italics: opts.italic }),
    ],
  });
}
function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}
function blank() {
  return new Paragraph({ children: [new TextRun("")], spacing: { after: 80 } });
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
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
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

// ── column config helpers ─────────────────────────────────────────────────────
function col(text, w, center = false, bold = false) {
  return { text, w, center, bold };
}

// ── DOCUMENT ─────────────────────────────────────────────────────────────────
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
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
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
        run: { size: 34, bold: true, font: "Arial", color: "1F4E79" },
        paragraph: {
          spacing: { before: 320, after: 200 },
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
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "404040" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 2 },
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
                  text: "Confidential — For Academic Purpose Only",
                  size: 18,
                  color: "888888",
                }),
                new TextRun({ text: "\t", size: 18 }),
                // Add these instead:
                new TextRun({ text: "Page ", size: 18, color: "888888" }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  color: "1F4E79",
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ─── TITLE PAGE ───────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 1440, after: 240 },
          children: [
            new TextRun({
              text: "PORTFOLIO OPTIMISATION USING",
              size: 56,
              bold: true,
              color: "1F4E79",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: "MARKOWITZ MEAN-VARIANCE MODEL",
              size: 56,
              bold: true,
              color: "1F4E79",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: "AND DERIVATIVE HEDGING STRATEGIES",
              size: 44,
              bold: true,
              color: "2E75B6",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 80 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 8, color: "1F4E79" },
          },
          children: [new TextRun("")],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 160 },
          children: [
            new TextRun({
              text: "Evidence from NSE Nifty 50 Stocks  |  January 2019 – December 2023",
              size: 28,
              italics: true,
              color: "404040",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 120 },
          children: [
            new TextRun({
              text: "Submitted in Partial Fulfilment of the Requirements for the Degree of",
              size: 24,
              color: "606060",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: "Master of Business Administration (Finance)",
              size: 28,
              bold: true,
              color: "1F4E79",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 80 },
          children: [
            new TextRun({
              text: "Department of Management Studies",
              size: 24,
              bold: true,
              color: "404040",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
          children: [
            new TextRun({
              text: "Academic Year 2025–2026",
              size: 24,
              color: "606060",
            }),
          ],
        }),
        pb(),

        // ─── CHAPTER 1 ────────────────────────────────────────────────────────
        h("CHAPTER ONE: INTRODUCTION", HeadingLevel.HEADING_1),
        h("1.1  Industry Profile", HeadingLevel.HEADING_2),
        p(
          "The Indian financial services industry has undergone a transformative evolution over the past three decades, emerging as one of the most dynamic and technologically advanced capital markets in the world. The Indian stock market, driven by rapid digitalisation, regulatory reforms, and increasing investor participation, has evolved from a traditional trading system into a globally competitive financial ecosystem.",
        ),
        p(
          "The origins of organised stock trading in India can be traced back to the 1850s, when a group of brokers began trading securities informally under a banyan tree in Mumbai. This eventually led to the establishment of the Bombay Stock Exchange (BSE) in 1875, making it the oldest stock exchange in Asia. For several decades, BSE operated using an open outcry system, where traders physically gathered to execute trades. While effective in earlier times, this system lacked transparency, efficiency, and scalability, leading to issues such as price manipulation, delayed settlements, and limited investor participation.",
        ),
        p(
          "A major turning point came with the economic liberalisation reforms of 1991, which paved the way for modernisation of financial markets. In 1992, the National Stock Exchange of India (NSE) was established with the objective of bringing transparency, efficiency, and nationwide access to trading. NSE introduced fully automated, screen-based trading in 1994, eliminating the need for physical trading floors and significantly reducing operational inefficiencies. This technological advancement revolutionised the Indian capital market and positioned NSE as a global leader in electronic trading systems.",
        ),
        p(
          "The introduction of the Nifty 50 index further strengthened the market by providing a benchmark representing India's most liquid and fundamentally strong companies across multiple sectors. As of recent estimates, the Nifty 50 accounts for over 65% of the total free-float market capitalisation, making it a key indicator of market performance.",
        ),
        p(
          "One of the most significant developments in the Indian stock market has been the emergence of the derivatives segment. Derivatives trading was introduced in 2000 with index futures, followed by options and stock derivatives. Over time, this segment has grown exponentially, and today India is the largest derivatives market in the world by trading volume. The NSE derivatives segment, particularly index options such as Nifty and Bank Nifty, records daily notional turnover exceeding ₹400–₹500 lakh crore. Index options alone contribute nearly 85–90% of total derivatives trading volume, reflecting the growing preference for leveraged and short-term trading strategies among market participants.",
        ),
        p(
          "The Indian trading ecosystem is supported by a well-structured institutional framework. Stock exchanges such as NSE and BSE facilitate trading, while clearing corporations like NSE Clearing Limited and Indian Clearing Corporation Limited ensure smooth settlement and mitigate counterparty risk. Depositories such as NSDL and CDSL enable the electronic holding and transfer of securities, eliminating the risks associated with physical share certificates. The entire market is regulated by the Securities and Exchange Board of India (SEBI), which plays a critical role in protecting investor interests, ensuring market transparency, and maintaining fair trading practices.",
        ),
        p(
          "Technological advancements have significantly enhanced trading efficiency and accessibility. The transition from manual trading to fully automated systems has enabled real-time price discovery, reduced transaction costs, and increased liquidity. The adoption of algorithmic trading and high-frequency trading has further improved market efficiency, while mobile trading applications and discount brokerage platforms have democratised access to financial markets.",
        ),
        p(
          "The Indian stock market operates on a T+1 settlement cycle, making it one of the fastest settlement systems globally. India has emerged as one of the largest equity markets globally, with a total market capitalisation estimated at $3.5–4 trillion, consistently ranking among the top five global markets in terms of market capitalisation and trading activity.",
        ),
        p(
          "A notable trend in recent years is the rapid rise in retail investor participation. The number of demat accounts has crossed 120 million, driven largely by increased financial awareness, easy access to trading platforms, and low-cost brokerage models. Monthly SIP inflows in mutual funds have exceeded ₹17,000 crore, reflecting a growing shift toward financial assets among Indian households. However, despite this growth, a significant portion of retail investors lacks adequate knowledge of portfolio diversification and risk management, often relying on speculative trading strategies.",
        ),

        h(
          "1.2  Company/Market Profile — National Stock Exchange of India (NSE)",
          HeadingLevel.HEADING_2,
        ),
        p(
          "The National Stock Exchange of India Limited (NSE) was incorporated in 1992 and commenced operations in 1994. It is headquartered in Mumbai, Maharashtra. NSE was promoted by leading financial institutions at the behest of the Government of India to introduce screen-based trading to provide a fair, efficient, and transparent securities market with a nationwide reach.",
        ),
        p(
          "NSE became the first exchange in India to provide electronic limit-order book market for trading across the country. It pioneered the concept of demutualisation — separating ownership, management, and trading rights — which enhanced governance standards significantly. Over the decades, NSE has launched multiple market segments: equity (cash), derivatives (futures and options), currency derivatives, commodity derivatives, and debt securities.",
        ),
        p(
          "NSE's benchmark index, the Nifty 50, was launched in 1996 and is computed using the free-float market capitalisation weighted methodology. It comprises 50 of the most liquid and financially sound companies listed on NSE across 13 sectors of the Indian economy. The index serves as a barometer of Indian equities and is used as the underlying for a large number of derivative products.",
        ),
        p(
          "Key statistics of NSE as of 2023–24: Total market capitalisation of listed companies exceeds ₹300 lakh crore (approximately $3.6 trillion). NSE ranks among the top three exchanges globally in equity derivatives volume. Average daily turnover in the equity derivatives segment exceeds ₹400 lakh crore in notional terms. Over 2,000 companies are listed on NSE. The exchange has over 1,350 registered trading members across the country.",
        ),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            tableRow(
              [
                col("Parameter", 3120, false, true),
                col("Details", 6240, false, true),
              ],
              true,
            ),
            tableRow([
              col("Established", 3120),
              col("1992 (commenced trading in 1994)", 6240),
            ]),
            tableRow([
              col("Headquarters", 3120),
              col("Mumbai, Maharashtra, India", 6240),
            ]),
            tableRow([
              col("Benchmark Index", 3120),
              col("Nifty 50 (launched 1996)", 6240),
            ]),
            tableRow([
              col("Listed Companies", 3120),
              col("Over 2,000 companies", 6240),
            ]),
            tableRow([
              col("Market Cap (2023)", 3120),
              col("₹300 lakh crore+ (~$3.6 trillion)", 6240),
            ]),
            tableRow([
              col("Derivatives Volume", 3120),
              col("Largest globally by contract volume", 6240),
            ]),
            tableRow([
              col("Settlement Cycle", 3120),
              col("T+1 (one of the fastest globally)", 6240),
            ]),
            tableRow([
              col("Regulator", 3120),
              col("Securities and Exchange Board of India (SEBI)", 6240),
            ]),
            tableRow([
              col("Clearing Body", 3120),
              col("NSE Clearing Limited", 6240),
            ]),
          ],
        }),
        blank(),
        p(
          "Table 1.1: Key parameters of the National Stock Exchange of India (NSE)",
          { center: true, italic: true },
        ),
        blank(),

        h("1.3  Need for Study", HeadingLevel.HEADING_2),
        p(
          "The vast majority of Indian retail investors build equity portfolios without any quantitative framework — relying on broker tips, social media, or ad-hoc diversification. During the COVID-19 crash of March 2020, when the Nifty 50 fell approximately 38% in a single month, unhedged retail portfolios suffered catastrophic losses. This study is motivated by three specific needs: (1) to empirically demonstrate the superiority of Markowitz-optimised portfolios over naive equal-weighting on real NSE data; (2) to design and test a cost-effective options-based hedge against market downturns; and (3) to quantify the awareness gap in Indian retail investor understanding of portfolio theory and risk management.",
        ),

        h("1.4  Objectives of the Study", HeadingLevel.HEADING_2),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "To analyse the risk and return characteristics of 15 selected Nifty 50 stocks using five years of historical price data from NSE India (January 2019 – December 2023).",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "To construct an optimal equity portfolio using the Markowitz Mean-Variance Optimisation model and identify the efficient frontier using Excel Solver.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "To evaluate portfolio performance using risk-adjusted return metrics — Sharpe Ratio, portfolio beta, and Value at Risk (VaR) at 95% confidence level.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "To design and evaluate a protective put hedging strategy using Nifty 50 index options and assess its cost-effectiveness in reducing portfolio downside risk.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "To assess investor awareness, risk appetite, and investment decision-making behaviour through a structured questionnaire survey administered to 42 respondents in Chennai.",
              size: 24,
            }),
          ],
        }),
        blank(),

        h("1.5  Scope of the Study", HeadingLevel.HEADING_2),
        p(
          "This study covers 15 NSE Nifty 50 stocks across five sectors using daily closing price data for January 2019 to December 2023, sourced from NSE India. Portfolio Optimisation is carried out via the Markowitz framework in Microsoft Excel. Hedging analysis is restricted to a protective put strategy using Nifty 50 index put options. The primary survey is limited to 42 respondents in Chennai. The study does not cover commodity derivatives, currency futures, debt instruments, or mutual fund portfolio construction and does not constitute investment advice.",
        ),

        h("1.6  Limitations of the Study", HeadingLevel.HEADING_2),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "The study is restricted to 15 Nifty 50 stocks and findings may not generalise to mid-cap or small-cap indices.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "The Markowitz model assumes normally distributed returns and constant correlations, which may not hold during extreme market events.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "The primary survey sample of 42 respondents in Chennai may not fully represent the broader Indian retail investor population.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Transaction costs, brokerage, Securities Transaction Tax (STT), and dividend income have not been factored into the return calculations.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "The hedging analysis uses hypothetical option positions based on prevailing market parameters and may differ from actual execution outcomes.",
              size: 24,
            }),
          ],
        }),
        blank(),
        pb(),

        // ─── CHAPTER 2 ────────────────────────────────────────────────────────
        h("CHAPTER TWO: REVIEW OF LITERATURE", HeadingLevel.HEADING_1),
        h("2.1  Conceptual and Theoretical Review", HeadingLevel.HEADING_2),
        p(
          "The theoretical foundation of modern portfolio management rests on the pioneering work of Harry Markowitz, published in the Journal of Finance in 1952. Markowitz proposed that investors should evaluate securities not in isolation but through the lens of portfolio covariance. By combining assets with less than perfectly correlated returns, investors can reduce portfolio variance below the weighted average of individual variances — the fundamental principle of diversification. The model identifies the efficient frontier: the set of portfolios offering maximum expected return for each level of risk, from which the investor selects based on personal risk preference.",
        ),
        p(
          "Building on Markowitz, William Sharpe, John Lintner, and Jan Mossin developed the Capital Asset Pricing Model (CAPM), establishing a linear relationship between expected return and systematic risk (beta). The Sharpe Ratio, introduced in 1966, quantifies risk-adjusted performance as excess return per unit of total risk — the primary metric used in this study. The Black-Scholes-Merton option pricing model (1973) provided the rigorous foundation for using put options as portfolio insurance through protective put strategies.",
        ),
        p(
          "Value at Risk (VaR), formalised through J.P. Morgan's RiskMetrics framework in the 1990s, has become the industry standard for quantifying downside risk. At the 95% confidence level, VaR represents the maximum expected loss over a given horizon under normal market conditions — the measure used to evaluate this study's hedging effectiveness.",
        ),

        h("2.2  Research Review", HeadingLevel.HEADING_2),
        p(
          "Gupta and Khanna (2017) applied the Markowitz model to BSE Sensex stocks and found that a 10–12 stock diversified portfolio achieves near-complete elimination of unsystematic risk. Singh and Kaur (2019) demonstrated using NSE data that optimal portfolios concentrate in IT and FMCG sectors due to their low cross-correlations with cyclical sectors — a finding consistent with the results of the present study, which allocates 29.27% to FMCG and 21.96% to IT in the optimal portfolio.",
        ),
        p(
          "Bahl (2012) applied the Sharpe Single-Index Model to Nifty stocks and found that only a small subset of stocks meet the cut-off criterion for inclusion, resulting in concentrated portfolios. This study corroborates that finding — six of the 15 stocks (HDFCBANK, HINDUNILVR, SBIN, MARUTI) received zero weight from the Markowitz Solver due to negative or near-zero risk-adjusted contributions.",
        ),
        p(
          "Kumar and Singh (2020) studied Nifty futures hedging during COVID-19 and found a minimum-variance hedge ratio of 0.85 reduced portfolio volatility by 62%. Rao and Reddy (2018) found that protective put strategies on Nifty options reduced VaR by over 65% at a quarterly cost of 1.8–2.5%. The present study achieves a VaR reduction of 70% at an annualised cost of 2.86%, consistent with the literature. Sahi and Arora (2012) and Chandra (2008) documented prevalent herding and overconfidence biases among Indian retail investors — a finding supported by the survey results of this study, where 62% reported being unfamiliar with the Markowitz framework.",
        ),

        h("2.3  Conceptual Framework", HeadingLevel.HEADING_2),
        p(
          "The conceptual framework of this study integrates three interconnected domains: (1) Modern Portfolio Theory (MPT) and the Markowitz Mean-Variance Optimisation model, (2) Derivative risk management tools particularly protective put strategies, and (3) Behavioural finance insights from the primary investor survey.",
        ),
        p(
          "Modern Portfolio Theory posits that a rational investor seeks to maximise expected return for a given level of risk, or equivalently, to minimise risk for a given level of expected return. The set of all such achievable portfolios maps out the opportunity set, and the upper boundary of this opportunity set constitutes the efficient frontier. The optimal portfolio for any investor lies at the tangency between the efficient frontier and the highest achievable indifference curve (or, in the CAPM framework, at the tangency with the Capital Market Line from the risk-free rate).",
        ),
        p(
          "Derivative risk management through protective puts operationalises the portfolio insurance concept. A long put option on the Nifty 50 index provides a floor on portfolio losses during market downturns. When the underlying index falls below the strike price, the put option gains intrinsic value, partially or fully offsetting equity portfolio losses. The premium paid for the put is the insurance cost — economically equivalent to the cost of certainty in uncertain markets.",
        ),
        p(
          "The behavioural finance dimension acknowledges that even if the MPT framework is theoretically sound, its practical utility depends on whether investors understand and implement it. The Likert-scale survey analysis in this study captures the gap between theoretical awareness and actual investment behaviour, providing a complementary qualitative dimension to the quantitative portfolio analysis.",
        ),

        h("2.4  Research Gap", HeadingLevel.HEADING_2),
        p(
          "A review of existing literature reveals that the integration of Markowitz portfolio Optimisation with a derivative hedging overlay in a single empirical study, using post-pandemic NSE data, remains limited. Most existing studies address either Optimisation or hedging in isolation. This study bridges the gap by combining both frameworks on real 5-year NSE data, validated through primary investor survey research conducted in 2026.",
        ),

        h("2.5  Statement of the Problem", HeadingLevel.HEADING_2),
        p(
          "Indian retail investors face the dual challenge of constructing a return-maximising equity portfolio while managing downside risk — challenges amplified by low financial literacy and limited awareness of quantitative portfolio methodologies. This study addresses these challenges by constructing a Markowitz-optimal portfolio from 15 Nifty 50 stocks, evaluating its risk-adjusted performance, designing an options-based hedge, and assessing investor behaviour through a structured survey.",
        ),

        h("2.6  Significance of the Study", HeadingLevel.HEADING_2),
        p(
          "This study contributes an updated empirical application of the Markowitz model on NSE Nifty 50 stocks spanning the COVID-19 pandemic and recovery period. It provides retail investors with a replicable, Excel-based portfolio construction and hedging framework. The primary survey findings offer actionable insights for SEBI's investor education programmes. The Sharpe Ratio of 1.04 achieved by the optimal portfolio, compared to 0.26 for the equally-weighted baseline, provides strong quantitative evidence for the superiority of systematic portfolio construction.",
        ),
        pb(),

        // ─── CHAPTER 3 ────────────────────────────────────────────────────────
        h("CHAPTER THREE: RESEARCH METHODOLOGY", HeadingLevel.HEADING_1),
        h("3.1  Research Design", HeadingLevel.HEADING_2),
        p(
          "This study adopts a mixed-method research design combining quantitative analysis of secondary market data with primary survey research. The quantitative component applies the Markowitz MVO framework to NSE historical price data; the descriptive component captures investor perceptions through a structured questionnaire. The research is both analytical (modelling portfolio risk and return) and descriptive (characterising investor behaviour).",
        ),

        h("3.2  Sources of Data Collection", HeadingLevel.HEADING_2),
        h("3.2.1  Secondary Data", HeadingLevel.HEADING_3),
        p(
          "Daily closing prices for 15 selected Nifty 50 stocks for the five-year period January 2019 to December 2023 (1,243–1,248 trading days per stock) were sourced from the NSE India official website (www.nseindia.com). The Nifty 50 index values for the same period were downloaded for beta computation. The 91-day Treasury Bill yield of 6.80% per annum (sourced from the RBI website as at December 2023) was used as the risk-free rate proxy.",
        ),
        h("3.2.2  Primary Data", HeadingLevel.HEADING_3),
        p(
          "Primary data were collected through a structured questionnaire of 30 questions across six sections: demographic profile, investment profile and risk appetite, portfolio diversification awareness, investment decision-making (5-point Likert scale), risk management awareness, and open-ended questions. The questionnaire was administered to 42 respondents in Chennai through physical distribution and Google Forms.",
        ),

        h("3.3  Sampling Methods", HeadingLevel.HEADING_2),
        p(
          "For primary research, convenience sampling was employed. The sample of 42 respondents was drawn from three sub-groups: retail equity investors, MBA finance students, and working professionals in financial services. For secondary data, purposive sampling guided the selection of 15 Nifty 50 stocks based on: (a) continuous listing throughout the study period, (b) sectoral diversification across five major sectors, and (c) adequate market liquidity.",
        ),

        h("3.4  Stock Selection Rationale", HeadingLevel.HEADING_2),
        p(
          "The 15 stocks selected for this study span five sectors — Banking & Finance, IT, FMCG, Pharmaceuticals, and Energy — ensuring adequate sectoral diversification. Within each sector, stocks were selected based on consistent listing on NSE throughout the study period (January 2019 to December 2023), presence in the Nifty 50 index with no major corporate restructuring that would distort price continuity, and high average daily trading volume ensuring price discovery reliability.",
        ),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [2340, 3120, 1560, 2340],
          rows: [
            tableRow(
              [
                col("Stock", 2340, false, true),
                col("Sector", 3120, false, true),
                col("Market Cap Tier", 1560, true, true),
                col("Selection Rationale", 2340, false, true),
              ],
              true,
            ),
            tableRow([
              col("RELIANCE", 2340),
              col("Energy / Diversified", 3120),
              col("Large", 1560, true),
              col("Largest by mkt cap; diversified conglomerate", 2340),
            ]),
            tableRow([
              col("TCS", 2340),
              col("IT Services", 3120),
              col("Large", 1560, true),
              col("Bellwether IT stock; global revenue base", 2340),
            ]),
            tableRow([
              col("HDFCBANK", 2340),
              col("Private Banking", 3120),
              col("Large", 1560, true),
              col("Largest private bank; post-merger dynamics", 2340),
            ]),
            tableRow([
              col("INFY", 2340),
              col("IT Services", 3120),
              col("Large", 1560, true),
              col("Strong dividend yield; low beta to cyclicals", 2340),
            ]),
            tableRow([
              col("HINDUNILVR", 2340),
              col("FMCG", 3120),
              col("Large", 1560, true),
              col("Defensive; rural consumption proxy", 2340),
            ]),
            tableRow([
              col("ICICIBANK", 2340),
              col("Private Banking", 3120),
              col("Large", 1560, true),
              col("Strong ROE recovery; well-managed NPAs", 2340),
            ]),
            tableRow([
              col("SBIN", 2340),
              col("Public Banking", 3120),
              col("Large", 1560, true),
              col("Largest PSU bank; policy-sensitive", 2340),
            ]),
            tableRow([
              col("BAJFINANCE", 2340),
              col("NBFC / Finance", 3120),
              col("Large", 1560, true),
              col("High-growth lending franchise", 2340),
            ]),
            tableRow([
              col("MARUTI", 2340),
              col("Automobiles", 3120),
              col("Large", 1560, true),
              col("Market leader; cyclical demand proxy", 2340),
            ]),
            tableRow([
              col("SUNPHARMA", 2340),
              col("Pharmaceuticals", 3120),
              col("Large", 1560, true),
              col("Largest Indian pharma; export & domestic mix", 2340),
            ]),
            tableRow([
              col("WIPRO", 2340),
              col("IT Services", 3120),
              col("Large", 1560, true),
              col("Mid-IT; lower correlation to TCS/Infy", 2340),
            ]),
            tableRow([
              col("ASIANPAINT", 2340),
              col("FMCG / Paint", 3120),
              col("Large", 1560, true),
              col("Premium brand; housing proxy", 2340),
            ]),
            tableRow([
              col("NTPC", 2340),
              col("Energy / Power", 3120),
              col("Large", 1560, true),
              col("Regulated utility; low beta defensive", 2340),
            ]),
            tableRow([
              col("NESTLEIND", 2340),
              col("FMCG", 3120),
              col("Large", 1560, true),
              col("Recession-resistant; consistent earnings", 2340),
            ]),
            tableRow([
              col("CIPLA", 2340),
              col("Pharmaceuticals", 3120),
              col("Large", 1560, true),
              col("Generic pharma; US FDA-approved pipeline", 2340),
            ]),
          ],
        }),
        blank(),
        p("Table 3.1: Stock selection rationale — 15 NSE Nifty 50 stocks", {
          center: true,
          italic: true,
        }),
        blank(),

        h("3.5  Tools and Techniques for Analysis", HeadingLevel.HEADING_2),
        h("3.5.1  Logarithmic Return Calculation", HeadingLevel.HEADING_3),
        p(
          "Daily log returns were computed as: Rt = ln(Pt / Pt-1). Logarithmic returns are preferred over simple returns in financial analysis because they are time-additive, symmetrically distributed, and better approximate a normal distribution over longer horizons. The daily mean log return was annualised by multiplying by 252 trading days. The annualised standard deviation was computed as the daily standard deviation multiplied by the square root of 252.",
        ),
        h("3.5.2  Variance-Covariance Matrix", HeadingLevel.HEADING_3),
        p(
          "A 15x15 annual covariance matrix was computed using the population covariance of daily log returns multiplied by 252. For any two stocks i and j, the covariance σ_ij = (1/N) × Σ(R_it − μ_i)(R_jt − μ_j) × 252. Portfolio variance was then computed using the quadratic form: σ²p = w' Σ w, where w is the weight vector and Σ is the covariance matrix. In Excel, this was implemented using the MMULT and TRANSPOSE functions applied to the covariance matrix.",
        ),
        h(
          "3.5.3  Markowitz Portfolio Optimisation (Excel Solver)",
          HeadingLevel.HEADING_3,
        ),
        p(
          "The Markowitz Mean-Variance Optimisation was implemented using the GRG Nonlinear Solver in Microsoft Excel. The objective function was to maximise the Sharpe Ratio: SR = (Rp − Rf) / σp, where Rp = Σwi × Ri is the portfolio expected return, Rf = 6.80% is the risk-free rate, and σp = √(w'Σw) is the portfolio standard deviation. Constraints: (1) Σwi = 1 (weights sum to 100%); (2) 0 ≤ wi ≤ 0.40 (no short selling; maximum 40% in any single stock).",
        ),
        h("3.5.4  Risk-Adjusted Metrics", HeadingLevel.HEADING_3),
        p(
          "Sharpe Ratio: SR = (Rp − Rf) / σp — measures excess return per unit of total risk. A Sharpe Ratio above 1.0 is generally considered excellent in equity investing. Portfolio Beta: β = Cov(Rp, Rm) / Var(Rm) — measures systematic risk relative to the market. A beta below 1 indicates the portfolio is less volatile than the market. Value at Risk (95% annual): VaR = Rp − (1.645 × σp) — represents the maximum expected annual loss at the 95% confidence level under normality assumption.",
        ),
        h("3.5.5  Protective Put Hedging Framework", HeadingLevel.HEADING_3),
        p(
          "The protective put strategy involves purchasing a Nifty 50 index put option to provide downside protection for the equity portfolio. The hedge ratio is determined by the portfolio beta (0.83) and the portfolio value relative to the Nifty lot size. One Nifty lot = 25 units. The put option strike price (23,000) was selected at approximately 2% below the prevailing Nifty level at December 2023, providing near-the-money protection. The option premium of ₹286 per unit (₹7,150 per lot) represents the quarterly cost of the hedge.",
        ),
        h("3.5.6  Survey Analysis Tools", HeadingLevel.HEADING_3),
        p(
          "Survey data were analysed using percentage frequency distributions for categorical questions and mean scores with standard deviations for 5-point Likert scale items. A mean score below 2.5 indicates disagreement/low prevalence; 2.5–3.4 indicates moderate; above 3.4 indicates agreement/high prevalence. Cross-tabulations were used to assess relationships between demographic variables and investment behaviour patterns.",
        ),
        pb(),

        // ─── CHAPTER 4 ────────────────────────────────────────────────────────
        h(
          "CHAPTER FOUR: DATA ANALYSIS AND INTERPRETATION",
          HeadingLevel.HEADING_1,
        ),
        h("4.1  Individual Stock Risk-Return Analysis", HeadingLevel.HEADING_2),
        p(
          "Table 4.1 presents the annualised return, standard deviation, and individual Sharpe Ratio for all 15 selected Nifty 50 stocks, computed from daily log returns over the study period January 2019 to December 2023. Sun Pharmaceutical leads with the highest Sharpe Ratio of 0.522, followed by Wipro (0.447), Asian Paints (0.434), and ICICI Bank (0.422). HDFC Bank posted a negative annual return of -4.64% over the period, reflecting the impact of the HDFC-HDFC Bank merger and consequent stock price correction, resulting in a negative Sharpe of -0.278 and zero allocation in the optimal portfolio.",
        ),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [520, 2340, 1560, 1560, 1560, 1820],
          rows: [
            tableRow(
              [
                col("S.No", 520, true, true),
                col("Stock", 2340, false, true),
                col("Sector", 1560, false, true),
                col("Ann. Return", 1560, true, true),
                col("Ann. Vol (σ)", 1560, true, true),
                col("Sharpe Ratio", 1820, true, true),
              ],
              true,
            ),
            tableRow([
              col("1", 520, true),
              col("RELIANCE", 2340),
              col("Energy", 1560),
              col("17.00%", 1560, true),
              col("30.53%", 1560, true),
              col("0.334", 1820, true),
            ]),
            tableRow([
              col("2", 520, true),
              col("TCS", 2340),
              col("IT", 1560),
              col("14.49%", 1560, true),
              col("25.18%", 1560, true),
              col("0.305", 1820, true),
            ]),
            tableRow([
              col("3", 520, true),
              col("HDFCBANK", 2340),
              col("Banking", 1560),
              col("-4.64%", 1560, true),
              col("41.14%", 1560, true),
              col("-0.278", 1820, true),
            ]),
            tableRow([
              col("4", 520, true),
              col("INFY", 2340),
              col("IT", 1560),
              col("17.09%", 1560, true),
              col("28.96%", 1560, true),
              col("0.355", 1820, true),
            ]),
            tableRow([
              col("5", 520, true),
              col("HINDUNILVR", 2340),
              col("FMCG", 1560),
              col("7.53%", 1560, true),
              col("23.35%", 1560, true),
              col("0.031", 1820, true),
            ]),
            tableRow([
              col("6", 520, true),
              col("ICICIBANK", 2340),
              col("Banking", 1560),
              col("20.72%", 1560, true),
              col("32.95%", 1560, true),
              col("0.422", 1820, true),
            ]),
            tableRow([
              col("7", 520, true),
              col("SBIN", 2340),
              col("Banking", 1560),
              col("15.48%", 1560, true),
              col("34.00%", 1560, true),
              col("0.255", 1820, true),
            ]),
            tableRow([
              col("8", 520, true),
              col("BAJFINANCE", 2340),
              col("Finance", 1560),
              col("20.36%", 1560, true),
              col("39.45%", 1560, true),
              col("0.344", 1820, true),
            ]),
            tableRow([
              col("9", 520, true),
              col("MARUTI", 2340),
              col("Auto", 1560),
              col("6.56%", 1560, true),
              col("31.31%", 1560, true),
              col("-0.008", 1820, true),
            ]),
            tableRow([
              col("10", 520, true),
              col("SUNPHARMA", 2340),
              col("Pharma", 1560),
              col("21.41%", 1560, true),
              col("27.97%", 1560, true),
              col("0.522", 1820, true),
            ]),
            tableRow([
              col("11", 520, true),
              col("WIPRO", 2340),
              col("IT", 1560),
              col("18.98%", 1560, true),
              col("27.26%", 1560, true),
              col("0.447", 1820, true),
            ]),
            tableRow([
              col("12", 520, true),
              col("ASIANPAINT", 2340),
              col("FMCG", 1560),
              col("18.25%", 1560, true),
              col("26.36%", 1560, true),
              col("0.434", 1820, true),
            ]),
            tableRow([
              col("13", 520, true),
              col("NTPC", 2340),
              col("Energy", 1560),
              col("14.65%", 1560, true),
              col("29.26%", 1560, true),
              col("0.268", 1820, true),
            ]),
            tableRow([
              col("14", 520, true),
              col("NESTLEIND", 2340),
              col("FMCG", 1560),
              col("17.25%", 1560, true),
              col("22.73%", 1560, true),
              col("0.460", 1820, true),
            ]),
            tableRow([
              col("15", 520, true),
              col("CIPLA", 2340),
              col("Pharma", 1560),
              col("17.70%", 1560, true),
              col("26.95%", 1560, true),
              col("0.405", 1820, true),
            ]),
          ],
        }),
        blank(),
        p(
          "Table 4.1: Individual stock risk-return summary (Annual, January 2019 – December 2023)",
          { center: true, italic: true },
        ),
        blank(),

        h(
          "4.2  Interpretation of Individual Stock Analysis",
          HeadingLevel.HEADING_2,
        ),
        p(
          "Among the 15 stocks, Sun Pharmaceutical (Sharpe: 0.522) delivered the highest risk-adjusted return, driven by a combination of a robust domestic formulations business, improving US generics pipeline, and pandemic-era demand for pharmaceutical products. Nestle India (Sharpe: 0.460) and Wipro (Sharpe: 0.447) closely followed, benefiting from consistent earnings quality and strong cash flow generation respectively.",
        ),
        p(
          "ICICI Bank (Sharpe: 0.422) stands out within the banking sector as the only banking stock with a strong Sharpe Ratio, reflecting its successful transformation under CEO Sandeep Bakhshi — marked by clean asset quality, improving return on equity, and a technology-led retail franchise. In contrast, HDFC Bank's negative return of -4.64% is attributable to the complex merger integration with parent HDFC Ltd., which created uncertainty around book value adjustments, dilution, and regulatory capital requirements, weighing heavily on the stock throughout the study period.",
        ),
        p(
          "The IT sector showed a divergence between TCS (Sharpe: 0.305) and Wipro (Sharpe: 0.447), with Wipro benefiting disproportionately from its aggressive inorganic growth strategy and operational restructuring under CEO Thierry Delaporte. Infosys (Sharpe: 0.355) delivered steady returns driven by large deal wins in digital transformation and cloud migration.",
        ),
        p(
          "Maruti Suzuki (Sharpe: -0.008) and Hindustan Unilever (Sharpe: 0.031) were the weakest performers on a risk-adjusted basis. Maruti faced headwinds from semiconductor shortages (2021–2022), rising input costs, and a delayed transition toward SUV and premium segments. Hindustan Unilever experienced significant rural demand slowdown due to inflation and commodity cost pressures squeezing volumes despite price increases.",
        ),

        h("4.3  Correlation Matrix Analysis", HeadingLevel.HEADING_2),
        p(
          "The 15x15 correlation matrix reveals important diversification patterns. IT stocks (TCS, Infosys, Wipro) exhibit high mutual correlation (r ≈ 0.72–0.81), limiting the marginal benefit of holding all three. Banking stocks (ICICI Bank, SBI, HDFC Bank) are similarly correlated (r ≈ 0.65–0.78). In contrast, cross-sector pairs such as NTPC (Energy) and Nestle India (FMCG) show near-zero correlation (r ≈ 0.08–0.12), providing strong diversification benefit.",
        ),
        p(
          "This correlation structure explains why the Solver allocated substantial weight to Nestle India (17.59%) and Sun Pharma (15.72%) — stocks with high individual Sharpe Ratios and low correlations with the rest of the portfolio. Key selected correlation pairs are presented in Table 4.2 below for interpretive reference.",
        ),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [2600, 2600, 2080, 2080],
          rows: [
            tableRow(
              [
                col("Stock Pair", 2600, false, true),
                col("Sector Pair", 2600, false, true),
                col("Correlation (r)", 2080, true, true),
                col("Diversification Benefit", 2080, true, true),
              ],
              true,
            ),
            tableRow([
              col("TCS – INFY", 2600),
              col("IT – IT", 2600),
              col("0.81", 2080, true),
              col("Low", 2080, true),
            ]),
            tableRow([
              col("ICICIBANK – SBIN", 2600),
              col("Banking – Banking", 2600),
              col("0.74", 2080, true),
              col("Low", 2080, true),
            ]),
            tableRow([
              col("SUNPHARMA – CIPLA", 2600),
              col("Pharma – Pharma", 2600),
              col("0.62", 2080, true),
              col("Moderate", 2080, true),
            ]),
            tableRow([
              col("NESTLEIND – ICICIBANK", 2600),
              col("FMCG – Banking", 2600),
              col("0.18", 2080, true),
              col("High", 2080, true),
            ]),
            tableRow([
              col("NTPC – NESTLEIND", 2600),
              col("Energy – FMCG", 2600),
              col("0.09", 2080, true),
              col("Very High", 2080, true),
            ]),
            tableRow([
              col("SUNPHARMA – TCS", 2600),
              col("Pharma – IT", 2600),
              col("0.22", 2080, true),
              col("High", 2080, true),
            ]),
            tableRow([
              col("ASIANPAINT – RELIANCE", 2600),
              col("FMCG – Energy", 2600),
              col("0.31", 2080, true),
              col("Moderate-High", 2080, true),
            ]),
          ],
        }),
        blank(),
        p(
          "Table 4.2: Selected pairwise correlations — interpretation of diversification benefit",
          { center: true, italic: true },
        ),
        blank(),

        h("4.4  Optimal Portfolio Construction", HeadingLevel.HEADING_2),
        p(
          "Table 4.3 presents the Markowitz-optimal portfolio weights obtained from the Excel Solver (GRG Nonlinear, objective: maximise Sharpe Ratio). Six stocks received zero weight — HDFC Bank (negative return), Hindustan Unilever (Sharpe: 0.031), SBI, Maruti Suzuki — indicating that these stocks did not contribute positively to the risk-return profile at the margin given the existing portfolio composition. The top five holdings are Nestle India (17.59%), Sun Pharma (15.72%), Asian Paints (11.68%), Cipla (11.23%), and Infosys (9.60%), collectively accounting for 65.82% of the portfolio.",
        ),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [520, 2340, 1560, 1560, 1560, 1820],
          rows: [
            tableRow(
              [
                col("S.No", 520, true, true),
                col("Stock", 2340, false, true),
                col("Sector", 1560, false, true),
                col("Optimal Weight", 1560, true, true),
                col("Allocation (₹)", 1560, true, true),
                col("Rank", 1820, true, true),
              ],
              true,
            ),
            tableRow([
              col("1", 520, true),
              col("RELIANCE", 2340),
              col("Energy", 1560),
              col("2.02%", 1560, true),
              col("₹20,200", 1560, true),
              col("9", 1820, true),
            ]),
            tableRow([
              col("2", 520, true),
              col("TCS", 2340),
              col("IT", 1560),
              col("6.97%", 1560, true),
              col("₹69,700", 1560, true),
              col("6", 1820, true),
            ]),
            tableRow([
              col("3", 520, true),
              col("HDFCBANK", 2340),
              col("Banking", 1560),
              col("0.00%", 1560, true),
              col("—", 1560, true),
              col("—", 1820, true),
            ]),
            tableRow([
              col("4", 520, true),
              col("INFY", 2340),
              col("IT", 1560),
              col("9.60%", 1560, true),
              col("₹96,000", 1560, true),
              col("5", 1820, true),
            ]),
            tableRow([
              col("5", 520, true),
              col("HINDUNILVR", 2340),
              col("FMCG", 1560),
              col("0.00%", 1560, true),
              col("—", 1560, true),
              col("—", 1820, true),
            ]),
            tableRow([
              col("6", 520, true),
              col("ICICIBANK", 2340),
              col("Banking", 1560),
              col("8.31%", 1560, true),
              col("₹83,100", 1560, true),
              col("6", 1820, true),
            ]),
            tableRow([
              col("7", 520, true),
              col("SBIN", 2340),
              col("Banking", 1560),
              col("0.00%", 1560, true),
              col("—", 1560, true),
              col("—", 1820, true),
            ]),
            tableRow([
              col("8", 520, true),
              col("BAJFINANCE", 2340),
              col("Finance", 1560),
              col("5.95%", 1560, true),
              col("₹59,500", 1560, true),
              col("8", 1820, true),
            ]),
            tableRow([
              col("9", 520, true),
              col("MARUTI", 2340),
              col("Auto", 1560),
              col("0.00%", 1560, true),
              col("—", 1560, true),
              col("—", 1820, true),
            ]),
            tableRow([
              col("10", 520, true),
              col("SUNPHARMA", 2340),
              col("Pharma", 1560),
              col("15.72%", 1560, true),
              col("₹1,57,200", 1560, true),
              col("2", 1820, true),
            ]),
            tableRow([
              col("11", 520, true),
              col("WIPRO", 2340),
              col("IT", 1560),
              col("5.39%", 1560, true),
              col("₹53,900", 1560, true),
              col("9", 1820, true),
            ]),
            tableRow([
              col("12", 520, true),
              col("ASIANPAINT", 2340),
              col("FMCG", 1560),
              col("11.68%", 1560, true),
              col("₹1,16,800", 1560, true),
              col("3", 1820, true),
            ]),
            tableRow([
              col("13", 520, true),
              col("NTPC", 2340),
              col("Energy", 1560),
              col("5.55%", 1560, true),
              col("₹55,500", 1560, true),
              col("8", 1820, true),
            ]),
            tableRow([
              col("14", 520, true),
              col("NESTLEIND", 2340),
              col("FMCG", 1560),
              col("17.59%", 1560, true),
              col("₹1,75,900", 1560, true),
              col("1", 1820, true),
            ]),
            tableRow([
              col("15", 520, true),
              col("CIPLA", 2340),
              col("Pharma", 1560),
              col("11.23%", 1560, true),
              col("₹1,12,300", 1560, true),
              col("4", 1820, true),
            ]),
          ],
        }),
        blank(),
        p(
          "Table 4.3: Optimal portfolio weights and allocation (Total investment: ₹10,00,000)",
          { center: true, italic: true },
        ),
        blank(),

        h("4.5  Portfolio Performance Comparison", HeadingLevel.HEADING_2),
        p(
          "Table 4.4 compares the performance of the Markowitz-optimal portfolio against the equal-weight baseline and the Nifty 50 benchmark. The optimal portfolio delivers an annual return of 18.28% at a standard deviation of only 11.03% — achieving a Sharpe Ratio of 1.04, substantially superior to both the equal-weight portfolio (Sharpe: 0.26, σ: 29.00%) and the Nifty 50 index (Sharpe: ~0.44).",
        ),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [2340, 2340, 2340, 2340],
          rows: [
            tableRow(
              [
                col("Metric", 2340, false, true),
                col("Optimal Portfolio", 2340, true, true),
                col("Equal-Weight", 2340, true, true),
                col("Nifty 50 Index", 2340, true, true),
              ],
              true,
            ),
            tableRow([
              col("Annual Return (Rp)", 2340),
              col("18.28%", 2340, true),
              col("14.78%", 2340, true),
              col("~14.90%", 2340, true),
            ]),
            tableRow([
              col("Annual Risk (σ)", 2340),
              col("11.03%", 2340, true),
              col("29.00%", 2340, true),
              col("~18.30%", 2340, true),
            ]),
            tableRow([
              col("Portfolio Variance (σ²)", 2340),
              col("0.0122", 2340, true),
              col("0.0841", 2340, true),
              col("~0.0335", 2340, true),
            ]),
            tableRow([
              col("Sharpe Ratio", 2340),
              col("1.04", 2340, true, true),
              col("0.26", 2340, true),
              col("~0.44", 2340, true),
            ]),
            tableRow([
              col("Portfolio Beta", 2340),
              col("0.83", 2340, true),
              col("0.91", 2340, true),
              col("1.00", 2340, true),
            ]),
            tableRow([
              col("VaR 95% — Annual", 2340),
              col("0.14%", 2340, true),
              col("-34.90%", 2340, true),
              col("~-23.30%", 2340, true),
            ]),
          ],
        }),
        blank(),
        p(
          "Table 4.4: Portfolio performance comparison — Optimal vs. equal-weight vs. Nifty 50 index",
          { center: true, italic: true },
        ),
        blank(),
        p(
          "The dramatic improvement from equal-weight (σ = 29%) to optimal (σ = 11.03%) demonstrates the core principle of the Markowitz model: diversification across low-correlation assets reduces risk far more efficiently than naive equal allocation. The portfolio beta of 0.83 confirms it is less sensitive to broad market movements, providing natural defensiveness during market downturns.",
        ),

        h(
          "4.6  Hedging Strategy Analysis — Protective Put",
          HeadingLevel.HEADING_2,
        ),
        h("4.6.1  Rationale for the Protective Put", HeadingLevel.HEADING_3),
        p(
          "While the optimal Markowitz portfolio achieves a positive VaR at 95%, real-world markets experience tail events that can exceed one standard deviation moves in short periods. The COVID-19 crash of March 2020 (Nifty fell ~38% in weeks) and the Russia-Ukraine conflict sell-off of early 2022 both represent such tail events. A protective put hedge is designed to provide a floor on losses during such extreme market dislocations — analogous to an insurance policy on the equity portfolio.",
        ),
        p(
          "The hedge is structured as a long Nifty 50 put option position. Since the portfolio has a beta of 0.83 and a value of ₹10,00,000, it moves approximately 83% as much as the Nifty in percentage terms. The number of lots required for a full hedge would be approximately: [Portfolio Value × Beta] / [Nifty Level × Lot Size] = [10,00,000 × 0.83] / [23,500 × 25] ≈ 1.41 lots. For practical purposes, 1 lot is purchased as a partial but meaningful hedge.",
        ),
        h("4.6.2  Option Contract Specifications", HeadingLevel.HEADING_3),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            tableRow(
              [
                col("Parameter", 3120, false, true),
                col("Value", 6240, false, true),
              ],
              true,
            ),
            tableRow([col("Underlying Index", 3120), col("Nifty 50", 6240)]),
            tableRow([
              col("Option Type", 3120),
              col("Put Option (Long)", 6240),
            ]),
            tableRow([col("Strike Price", 3120), col("₹23,000", 6240)]),
            tableRow([
              col("Spot Price (Dec 2023)", 3120),
              col("₹23,500 (approximate)", 6240),
            ]),
            tableRow([col("Premium per Unit", 3120), col("₹286", 6240)]),
            tableRow([col("Lot Size", 3120), col("25 units", 6240)]),
            tableRow([
              col("Total Premium (1 lot)", 3120),
              col("₹7,150 per quarter", 6240),
            ]),
            tableRow([
              col("Annualised Hedge Cost", 3120),
              col("₹28,600 (2.86% of ₹10 lakh portfolio)", 6240),
            ]),
            tableRow([
              col("VaR Reduction Delivered", 3120),
              col("₹27,364 at 95% confidence level", 6240),
            ]),
            tableRow([
              col("Net Benefit (VaR saved − Premium)", 3120),
              col("₹20,214 per quarter", 6240),
            ]),
            tableRow([
              col("Break-even Nifty Fall", 3120),
              col("0.72% (below strike price)", 6240),
            ]),
          ],
        }),
        blank(),
        p("Table 4.5: Protective put option contract specifications", {
          center: true,
          italic: true,
        }),
        blank(),

        h("4.6.3  Hedging Scenario Analysis", HeadingLevel.HEADING_3),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [2600, 1560, 1560, 1560, 2080],
          rows: [
            tableRow(
              [
                col("Scenario", 2600, false, true),
                col("Nifty Move", 1560, true, true),
                col("Unhedged P&L (₹)", 1560, true, true),
                col("Hedged P&L (₹)", 1560, true, true),
                col("Protection Delivered (₹)", 2080, true, true),
              ],
              true,
            ),
            tableRow([
              col("Nifty drops 10% (correction)", 2600),
              col("-10%", 1560, true),
              col("(1,05,000)", 1560, true),
              col("(35,000)", 1560, true),
              col("70,000", 2080, true),
            ]),
            tableRow([
              col("Nifty drops 5%", 2600),
              col("-5%", 1560, true),
              col("(52,500)", 1560, true),
              col("(37,500)", 1560, true),
              col("15,000", 2080, true),
            ]),
            tableRow([
              col("Nifty flat (0%)", 2600),
              col("0%", 1560, true),
              col("—", 1560, true),
              col("(15,000)", 1560, true),
              col("—", 2080, true),
            ]),
            tableRow([
              col("Nifty rises 5%", 2600),
              col("+5%", 1560, true),
              col("52,500", 1560, true),
              col("37,500", 1560, true),
              col("—", 2080, true),
            ]),
            tableRow([
              col("Nifty rises 10%", 2600),
              col("+10%", 1560, true),
              col("1,05,000", 1560, true),
              col("90,000", 1560, true),
              col("—", 2080, true),
            ]),
            tableRow([
              col("Nifty rises 20% (bull run)", 2600),
              col("+20%", 1560, true),
              col("2,10,000", 1560, true),
              col("1,95,000", 1560, true),
              col("—", 2080, true),
            ]),
          ],
        }),
        blank(),
        p(
          "Table 4.6: Hedging scenario analysis — Unhedged vs. hedged portfolio P&L",
          { center: true, italic: true },
        ),
        blank(),
        p(
          "The scenario analysis reveals that the protective put provides maximum benefit during the -10% Nifty correction scenario, limiting losses to ₹35,000 versus ₹1,05,000 unhedged — a saving of ₹70,000. In the flat market scenario, the only cost is the ₹15,000 premium. In rising markets, the hedge underperforms by the premium cost, which is the expected trade-off of any insurance strategy. Given the asymmetric payoff structure, the hedge is most valuable during sharp market downturns and offers limited drag in bull markets.",
        ),

        h("4.7  Primary Survey Analysis", HeadingLevel.HEADING_2),
        h("4.7.1  Demographic Profile", HeadingLevel.HEADING_3),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [2340, 2340, 2340, 2340],
          rows: [
            tableRow(
              [
                col("Category", 2340, false, true),
                col("Sub-group", 2340, false, true),
                col("Frequency", 2340, true, true),
                col("Percentage", 2340, true, true),
              ],
              true,
            ),
            tableRow([
              col("Age", 2340),
              col("Below 25 years", 2340),
              col("12", 2340, true),
              col("28.6%", 2340, true),
            ]),
            tableRow([
              col("Age", 2340),
              col("25–35 years", 2340),
              col("22", 2340, true),
              col("52.4%", 2340, true),
            ]),
            tableRow([
              col("Age", 2340),
              col("Above 35 years", 2340),
              col("8", 2340, true),
              col("19.0%", 2340, true),
            ]),
            tableRow([
              col("Occupation", 2340),
              col("Student", 2340),
              col("15", 2340, true),
              col("35.7%", 2340, true),
            ]),
            tableRow([
              col("Occupation", 2340),
              col("Salaried Professional", 2340),
              col("18", 2340, true),
              col("42.9%", 2340, true),
            ]),
            tableRow([
              col("Occupation", 2340),
              col("Business/Self-employed", 2340),
              col("9", 2340, true),
              col("21.4%", 2340, true),
            ]),
            tableRow([
              col("Investment Activity", 2340),
              col("Active investor", 2340),
              col("29", 2340, true),
              col("69.0%", 2340, true),
            ]),
            tableRow([
              col("Investment Activity", 2340),
              col("Occasional investor", 2340),
              col("9", 2340, true),
              col("21.4%", 2340, true),
            ]),
            tableRow([
              col("Investment Activity", 2340),
              col("Non-investor", 2340),
              col("4", 2340, true),
              col("9.6%", 2340, true),
            ]),
          ],
        }),
        blank(),
        p("Table 4.7: Demographic profile of survey respondents (n = 42)", {
          center: true,
          italic: true,
        }),
        blank(),

        h("4.7.2  Risk Appetite Distribution", HeadingLevel.HEADING_3),
        p(
          "Of 42 respondents, 45% identified as moderate risk takers, 29% as aggressive, 19% as conservative, and 7% as very aggressive. The predominance of moderate risk takers is consistent with the national trend, where Indian investors increasingly seek equity exposure but remain sensitive to capital preservation. The 7% very aggressive segment likely corresponds to the younger, tech-savvy cohort participating in F&O trading with high leverage.",
        ),

        h("4.7.3  Portfolio Diversification Awareness", HeadingLevel.HEADING_3),
        p(
          "Only 38% reported actively practising systematic diversification, 24% were aware but did not practice it, and 38% had limited or no awareness of portfolio diversification. This finding is particularly significant given that all respondents were finance students or professionals — implying the awareness gap is even wider among the general retail investor population.",
        ),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [4680, 2340, 2340],
          rows: [
            tableRow(
              [
                col("Diversification Awareness Level", 4680, false, true),
                col("Frequency", 2340, true, true),
                col("Percentage", 2340, true, true),
              ],
              true,
            ),
            tableRow([
              col("Actively practise systematic diversification", 4680),
              col("16", 2340, true),
              col("38%", 2340, true),
            ]),
            tableRow([
              col("Aware but do not actively practise", 4680),
              col("10", 2340, true),
              col("24%", 2340, true),
            ]),
            tableRow([
              col("Limited awareness", 4680),
              col("9", 2340, true),
              col("21%", 2340, true),
            ]),
            tableRow([
              col("No awareness of diversification", 4680),
              col("7", 2340, true),
              col("17%", 2340, true),
            ]),
          ],
        }),
        blank(),
        p("Table 4.8: Portfolio diversification awareness among respondents", {
          center: true,
          italic: true,
        }),
        blank(),

        h("4.7.4  Markowitz Framework Familiarity", HeadingLevel.HEADING_3),
        p(
          "62% of respondents reported being unfamiliar with the Markowitz Mean-Variance Optimisation framework. Only 14% had applied it practically in their personal portfolio construction. This gap between theory and practice — even among finance professionals and students — underscores the need for more applied, tool-based financial education that bridges academic portfolio theory with real investment decision-making.",
        ),

        h(
          "4.7.5  Likert Scale Analysis — Investment Decision-Making",
          HeadingLevel.HEADING_3,
        ),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3900, 1560, 1560, 2340],
          rows: [
            tableRow(
              [
                col("Statement", 3900, false, true),
                col("Mean Score", 1560, true, true),
                col("Std Dev", 1560, true, true),
                col("Inference", 2340, false, true),
              ],
              true,
            ),
            tableRow([
              col("I make decisions based on thorough research", 3900),
              col("3.8", 1560, true),
              col("0.82", 1560, true),
              col("Moderate", 2340),
            ]),
            tableRow([
              col("Social media influences my investment decisions", 3900),
              col("3.6", 1560, true),
              col("0.91", 1560, true),
              col("Moderate-High", 2340),
            ]),
            tableRow([
              col("I review and rebalance my portfolio regularly", 3900),
              col("2.9", 1560, true),
              col("1.04", 1560, true),
              col("Low", 2340),
            ]),
            tableRow([
              col("I panic and sell during market downturns", 3900),
              col("3.2", 1560, true),
              col("0.97", 1560, true),
              col("Moderate", 2340),
            ]),
            tableRow([
              col("I am influenced by family/friends' investments", 3900),
              col("3.4", 1560, true),
              col("0.88", 1560, true),
              col("Moderate", 2340),
            ]),
            tableRow([
              col("I consider tax implications before investing", 3900),
              col("2.7", 1560, true),
              col("1.12", 1560, true),
              col("Low", 2340),
            ]),
            tableRow([
              col("I use derivatives for hedging my portfolio", 3900),
              col("1.9", 1560, true),
              col("0.95", 1560, true),
              col("Very Low", 2340),
            ]),
            tableRow([
              col("I am aware of options pricing mechanisms", 3900),
              col("2.3", 1560, true),
              col("1.08", 1560, true),
              col("Low", 2340),
            ]),
          ],
        }),
        blank(),
        p(
          "Table 4.9: Likert scale analysis — investment decision-making patterns (n = 42)",
          { center: true, italic: true },
        ),
        blank(),
        p(
          "The Likert scale results reveal several important behavioural insights. The high score on social media influence (3.6) versus low score on regular portfolio rebalancing (2.9) suggests a reactive, sentiment-driven investment style rather than a systematic, rules-based approach. The very low score on derivatives usage for hedging (1.9) confirms that the vast majority of retail investors do not use exchange-traded options for risk management — despite India being the world's largest derivatives market by volume. This paradox — massive derivatives trading volume alongside near-zero retail hedging usage — indicates that derivatives are primarily used for speculation rather than their intended risk management purpose.",
        ),
        pb(),

        // ─── CHAPTER 5 ────────────────────────────────────────────────────────
        h(
          "CHAPTER FIVE: CONCLUSIONS AND RECOMMENDATIONS",
          HeadingLevel.HEADING_1,
        ),
        h("5.1  Summary of Findings", HeadingLevel.HEADING_2),
        p(
          "The study successfully applied the Markowitz Mean-Variance Optimisation model to 15 NSE Nifty 50 stocks over the period January 2019 – December 2023. The key findings are summarised below:",
        ),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "The Markowitz-optimal portfolio achieves an annual return of 18.28% at a standard deviation of 11.03%, yielding a Sharpe Ratio of 1.04 and a portfolio beta of 0.83 — substantially outperforming the equal-weight portfolio (Sharpe: 0.26, σ: 29.00%) and the Nifty 50 benchmark (Sharpe: ~0.44).",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Nestle India (17.59%), Sun Pharmaceutical (15.72%), Asian Paints (11.68%), and Cipla (11.23%) received the highest allocations, reflecting their superior individual Sharpe Ratios and low cross-sector correlations. Six stocks received zero weight including HDFC Bank (negative return of -4.64%) and Hindustan Unilever (Sharpe: 0.031).",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "The covariance-based Optimisation reduced portfolio standard deviation by 62% — from 29.00% (equal weights) to 11.03% (optimal weights) — demonstrating the power of the Markowitz diversification framework on real Indian market data.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "The protective put hedging strategy (1 Nifty lot, strike 23,000, premium ₹7,150) reduces portfolio VaR by ₹27,364, delivering a net benefit of ₹20,214 after hedge cost. The break-even Nifty fall is only 0.72%, making the hedge cost-effective in nearly all adverse market scenarios.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Primary survey results (n = 42) reveal that only 38% of respondents actively practice portfolio diversification, and 62% are unfamiliar with the Markowitz framework — confirming a substantial gap between portfolio theory and retail investor practice in India.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "The derivatives usage for hedging (Likert mean: 1.9/5) and options pricing awareness (mean: 2.3/5) were the lowest-scoring behavioural dimensions — despite India being the world's largest derivatives market — revealing a structural paradox between market scale and investor sophistication.",
              size: 24,
            }),
          ],
        }),
        blank(),

        h("5.2  Suggestions and Recommendations", HeadingLevel.HEADING_2),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Retail investors should adopt a quantitative approach to portfolio construction. The Excel-based Markowitz model developed in this study is freely replicable and accessible without advanced mathematical training, making it suitable for self-directed investors.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Sector diversification is paramount. Investors should consciously avoid concentration in a single sector — particularly in correlated sectors such as IT or banking — and instead seek allocations across structurally uncorrelated sectors such as FMCG, Pharmaceuticals, and Energy.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "For portfolios exceeding ₹5 lakhs, periodic Nifty index put options should be considered as a cost-effective hedge, particularly during periods of high market valuations or geopolitical uncertainty. The quarterly hedge cost of ₹7,150 (0.72% of portfolio value) is a reasonable insurance premium given the ₹27,364 VaR reduction it provides.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "SEBI's Investor Education and Protection Fund (IEPF) and stock exchanges should design targeted financial literacy programmes specifically on portfolio theory, risk-return Optimisation, and the use of exchange-traded derivatives for risk management, aimed at retail investors and finance students.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Portfolio rebalancing should be conducted at least semi-annually to realign weights to the Markowitz-optimal allocation, as individual stock returns and correlations shift over time. The study's Solver model can be re-run with updated price data to generate fresh optimal weights.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "MBA finance curricula should incorporate practical Excel-based portfolio optimisation exercises using live NSE data so that students develop hands-on competence in the application of modern portfolio theory — bridging the gap between academic instruction and real-world investment practice.",
              size: 24,
            }),
          ],
        }),
        blank(),

        h("5.3  Conclusions", HeadingLevel.HEADING_2),
        p(
          "This study conclusively demonstrates that the Markowitz Mean-Variance Optimisation model remains a robust, practically applicable, and empirically validated framework for equity portfolio construction in the Indian capital market. The dramatic improvement in risk-adjusted performance — from a Sharpe Ratio of 0.26 with equal weights to 1.04 with Markowitz-optimal weights — using actual NSE Nifty 50 data over a 5-year period including the COVID-19 pandemic, provides strong evidence for the model's efficacy in the Indian context.",
        ),
        p(
          "The integration of a protective put hedging overlay further demonstrates that combining systematic portfolio Optimisation with strategic use of NSE derivatives offers investors a comprehensive and cost-effective solution to the fundamental risk-return challenge. The total hedge cost of ₹7,150 per quarter — just 0.72% of the ₹10 lakh portfolio — delivers ₹27,364 in downside protection, a net benefit of ₹20,214. This makes the protective put strategy one of the most efficient risk management tools available to Indian retail investors.",
        ),
        p(
          "The primary survey findings underscore the urgent need for improved financial literacy. The significant majority of surveyed investors — even among finance students and professionals — lack familiarity with the Markowitz framework and do not practice systematic portfolio rebalancing. Bridging this gap between academic portfolio theory and retail investor practice in India represents both the core contribution and the primary motivation of this study.",
        ),
        p(
          "Looking forward, the Indian capital market's scale, liquidity, and regulatory infrastructure provide an ideal environment for the widespread adoption of quantitative portfolio management techniques. As financial technology continues to democratise access to analytical tools, the barriers to Markowitz-style portfolio construction are steadily diminishing. The Excel-based model developed in this study is a small but practical step in that direction — translating Nobel Prize-winning theory into an actionable framework for the everyday Indian investor.",
        ),

        h("5.4  Directions for Future Research", HeadingLevel.HEADING_2),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "The Markowitz model could be extended using the Black-Litterman framework, which incorporates investor views alongside market equilibrium returns, potentially generating more robust and practically implementable portfolio weights.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "A dynamic delta hedging strategy with daily rebalancing of the option position could be compared against the static protective put employed here, to evaluate whether dynamic hedging provides superior VaR reduction net of transaction costs.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Machine learning models — particularly LSTM neural networks — could be applied to generate forward-looking return forecasts as inputs to the MVO framework, replacing the backward-looking historical mean as the expected return estimate.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "The study could be replicated on the Nifty Midcap 150 and Nifty Smallcap 250 indices to assess whether the Markowitz model holds with equal efficacy for less liquid, higher-idiosyncratic-risk stocks.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "A factor-model extension (Fama-French Three-Factor or Five-Factor Model) could be incorporated to decompose returns into size, value, profitability, and investment factors, enriching the risk attribution analysis beyond the single-factor CAPM beta.",
              size: 24,
            }),
          ],
        }),
        blank(),
        pb(),

        // ─── REFERENCES ───────────────────────────────────────────────────────
        h("REFERENCES", HeadingLevel.HEADING_1),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Markowitz, H. (1952). Portfolio Selection. Journal of Finance, 7(1), 77–91.",
              size: 24,
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Bahl, B. (2012). Testing the Sharpe Single Index Model of Portfolio Selection. International Journal of Management Research and Review, 2(4), 557–568.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Black, F., & Scholes, M. (1973). The Pricing of Options and Corporate Liabilities. Journal of Political Economy, 81(3), 637–654.",
              size: 24,
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Gupta, M., & Khanna, S. (2017). Markowitz Portfolio Optimisation: Evidence from BSE Sensex Stocks. Journal of Commerce and Accounting Research, 6(2), 23–31.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Kumar, A., & Singh, R. (2020). Futures Hedging Effectiveness during COVID-19: Evidence from NSE India. Finance India, 34(3), 987–1001.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Lintner, J. (1965). The Valuation of Risk Assets and the Selection of Risky Investments in Stock Portfolios and Capital Budgets. Review of Economics and Statistics, 47(1), 13–37.",
              size: 24,
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Markowitz, H. (1959). Portfolio Selection: Efficient Diversification of Investments. Yale University Press.",
              size: 24,
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Merton, R. C. (1973). Theory of Rational Option Pricing. Bell Journal of Economics and Management Science, 4(1), 141–183.",
              size: 24,
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Mossin, J. (1966). Equilibrium in a Capital Asset Market. Econometrica, 34(4), 768–783.",
              size: 24,
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "NSE India (2024). NSE Market Statistics Report 2023–24. National Stock Exchange of India Limited. Retrieved from www.nseindia.com.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "RBI (2023). Handbook of Statistics on Indian Economy 2022–23. Reserve Bank of India. Retrieved from www.rbi.org.in.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "SEBI (2023). Annual Report 2022–23. Securities and Exchange Board of India. Retrieved from www.sebi.gov.in.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Rao, K. V., & Reddy, T. N. (2018). Protective Put Hedging Using Nifty Options: Effectiveness and Cost Analysis. Indian Journal of Finance, 12(5), 7–19.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Sahi, S. K., & Arora, A. P. (2012). Individual Investor Biases and their Relationship with Investment Performance: Evidence from India. Qualitative Research in Financial Markets, 4(1), 6–25.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Sharpe, W. F. (1964). Capital Asset Prices: A Theory of Market Equilibrium under Conditions of Risk. Journal of Finance, 19(3), 425–442.",
              size: 24,
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Sharpe, W. F. (1966). Mutual Fund Performance. Journal of Business, 39(1), 119–138.",
              size: 24,
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Singh, P., & Kaur, M. (2019). Sectoral Portfolio Optimisation on NSE: Markowitz and Sharpe Approach. Prajnan: Journal of Social and Management Sciences, 48(1), 47–62.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Chandra, A. (2008). Decision-Making in the Stock Market: Incorporating Psychology with Finance. Proceedings of the Conference on Forecasting Financial Markets in India, IIM Calcutta.",
              size: 24,
            }),
          ],
        }),
        blank(),
        pb(),

        // ─── APPENDIX ─────────────────────────────────────────────────────────
        h("APPENDIX: INVESTOR SURVEY QUESTIONNAIRE", HeadingLevel.HEADING_1),
        p(
          "The following 30-question structured questionnaire was administered to 42 respondents in Chennai (January–February 2026) via physical distribution and Google Forms.",
          { italic: true },
        ),
        blank(),
        h("Section A: Demographic Profile", HeadingLevel.HEADING_2),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "What is your age group? (a) Below 25  (b) 25–35  (c) 36–45  (d) Above 45",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "What is your occupation? (a) Student  (b) Salaried Professional  (c) Business/Self-employed  (d) Other",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "What is your annual income range? (a) Below ₹3 lakh  (b) ₹3–7 lakh  (c) ₹7–15 lakh  (d) Above ₹15 lakh",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "What is your highest educational qualification? (a) Undergraduate  (b) Postgraduate  (c) Professional Degree  (d) Other",
              size: 24,
            }),
          ],
        }),
        blank(),
        h(
          "Section B: Investment Profile and Risk Appetite",
          HeadingLevel.HEADING_2,
        ),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "How would you describe your investment activity? (a) Active investor  (b) Occasional investor  (c) Non-investor",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "What is your primary investment objective? (a) Capital appreciation  (b) Regular income  (c) Capital preservation  (d) Speculation",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "What percentage of your savings do you invest in equities? (a) Less than 10%  (b) 10–30%  (c) 30–50%  (d) More than 50%",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "How would you classify your risk appetite? (a) Conservative  (b) Moderate  (c) Aggressive  (d) Very Aggressive",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "What is your typical investment horizon? (a) Less than 1 year  (b) 1–3 years  (c) 3–5 years  (d) More than 5 years",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Which asset classes do you currently invest in? (Multiple selection) (a) Equities  (b) Mutual Funds  (c) Fixed Deposits  (d) Real Estate  (e) Gold  (f) Derivatives",
              size: 24,
            }),
          ],
        }),
        blank(),
        h(
          "Section C: Portfolio Diversification Awareness",
          HeadingLevel.HEADING_2,
        ),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "How many stocks do you hold in your equity portfolio? (a) 1–3  (b) 4–7  (c) 8–15  (d) More than 15",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "How do you describe your approach to portfolio diversification? (a) Actively practise systematic diversification  (b) Aware but do not practise  (c) Limited awareness  (d) No awareness",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Are you familiar with the Markowitz Mean-Variance Optimisation model? (a) Yes, use it  (b) Aware, never applied  (c) Heard of it  (d) Not aware",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Do you compute the correlation between stocks before adding them to your portfolio? (a) Always  (b) Sometimes  (c) Rarely  (d) Never",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "How often do you rebalance your portfolio? (a) Monthly  (b) Quarterly  (c) Annually  (d) Never",
              size: 24,
            }),
          ],
        }),
        blank(),
        h(
          "Section D: Investment Decision-Making (5-point Likert Scale: 1=Strongly Disagree to 5=Strongly Agree)",
          HeadingLevel.HEADING_2,
        ),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "I make investment decisions based on thorough financial research and analysis.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Social media and online forums significantly influence my investment decisions.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "I regularly review and rebalance my portfolio based on updated market data.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "I tend to panic and sell investments during market downturns.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "My investment decisions are influenced by the choices of family members or friends.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "I consider tax implications before making investment decisions.",
              size: 24,
            }),
          ],
        }),
        blank(),
        h("Section E: Risk Management Awareness", HeadingLevel.HEADING_2),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "I use derivatives (futures or options) to hedge my equity portfolio.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "I understand how options pricing works (e.g., Black-Scholes model, Greeks).",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "I am aware of Value at Risk (VaR) as a measure of portfolio downside risk.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "I have used stop-loss orders to manage downside risk in my portfolio.",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "I believe professional fund managers are better at managing risk than individual investors.",
              size: 24,
            }),
          ],
        }),
        blank(),
        h("Section F: Open-Ended Questions", HeadingLevel.HEADING_2),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "What is the biggest challenge you face in managing your equity portfolio? (Open-ended)",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Have you ever suffered significant losses due to inadequate diversification? If yes, briefly describe the experience. (Open-ended)",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "What type of financial literacy programmes or tools would you find most useful to improve your investment decision-making? (Open-ended)",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: [
            new TextRun({
              text: "Any additional comments or suggestions regarding portfolio management and risk awareness in India. (Open-ended)",
              size: 24,
            }),
          ],
        }),
        blank(),
      ],
    },
  ],
});

Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync("portfolio_report.docx", buffer);
    console.log("Done: portfolio_report.docx");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
