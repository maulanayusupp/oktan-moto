// =============================================================================
// Instalment estimator (ILLUSTRATIVE). A flat-rate simulation, the format most
// Indonesian multifinance offers are quoted in — it is NOT a quote, an approval
// or an offer of credit. The UI states this next to every figure, and
// /compliance repeats it.
//
// Flat-rate maths (the market convention): total interest is charged on the
// financed principal for the whole tenor, then split evenly across the months.
// =============================================================================

export interface FinanceInput {
  priceIdr: number
  /** Down payment as a fraction of price, e.g. 0.3 for 30%. */
  downPaymentRatio: number
  /** Tenor in months. */
  months: number
  /** Flat annual rate, e.g. 0.09 for 9%/year. */
  annualRate: number
}

export interface FinanceEstimate {
  downPayment: number
  principal: number
  monthly: number
  totalInterest: number
  totalPaid: number
}

/** Tenors offered by the estimator UI (months). */
export const tenors: readonly number[] = [12, 24, 36, 48]

/** Down-payment options offered by the estimator UI (fractions of price). */
export const downPaymentRatios: readonly number[] = [0.2, 0.3, 0.4, 0.5]

/**
 * Indicative flat rate used by the estimator. Real rates depend on the lender,
 * the unit's age and the buyer's profile — this is a mid-market placeholder.
 */
export const indicativeAnnualRate = 0.11

export function estimate({
  priceIdr,
  downPaymentRatio,
  months,
  annualRate,
}: FinanceInput): FinanceEstimate {
  const downPayment = Math.round(priceIdr * downPaymentRatio)
  const principal = Math.max(priceIdr - downPayment, 0)
  const totalInterest = Math.round(principal * annualRate * (months / 12))
  const monthly = months > 0 ? Math.round((principal + totalInterest) / months) : 0

  return {
    downPayment,
    principal,
    monthly,
    totalInterest,
    totalPaid: downPayment + principal + totalInterest,
  }
}
