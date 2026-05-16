/**
 * Get status color for invoice display
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-50";
    case "pending":
      return "text-yellow-600 bg-yellow-50";
    case "failed":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

/**
 * Format amount to currency string
 */
export const formatAmount = (amount: number, currency: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100); // Convert from cents
};
