<?php

namespace consolidated_bills\Biller;

class BillingService
{
    private $pdo;
    
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }
    
    public function calculateBill(array $utilities, string $postcode): array
    {
        // Logic to calculate combined bill based on selected utilities and postcode
        $totalAmount = 0;
        $breakdown = [];
        
        foreach ($utilities as $utility) {
            // Get rate for the utility based on postcode
            $stmt = $this->pdo->prepare("SELECT rate FROM utility_rates WHERE utility = ? AND postcode_prefix = ?");
            $postcodePrefix = substr($postcode, 0, 4);
            $stmt->execute([$utility, $postcodePrefix]);
            $rate = $stmt->fetchColumn();
            
            // Calculate amount for this utility
            $amount = $this->calculateUtilityAmount($utility, $rate);
            $totalAmount += $amount;
            $breakdown[$utility] = $amount;
        }
        
        return [
            'total' => $totalAmount,
            'breakdown' => $breakdown,
            'monthly_payment' => $totalAmount / 12,
            'postcode' => $postcode
        ];
    }
    
    private function calculateUtilityAmount(string $utility, float $rate): float
    {
        // Simplified calculation logic
        $baseRates = [
            'electricity' => 1200,
            'gas' => 900,
            'water' => 600,
            'broadband' => 400
        ];
        
        return $baseRates[$utility] * $rate;
    }
}
