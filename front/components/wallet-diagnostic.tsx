"use client"

import { Button } from "@/components/ui/button"
import { diagnoseWalletEnvironment, logWalletEnvironment, getWalletName } from "@/lib/wallet-utils"
import { verifyWalletFix } from "@/lib/verify-wallet-fix"
import { useState } from "react"
import { AlertCircle, CheckCircle, Info, Wallet, TestTube } from "lucide-react"

export function WalletDiagnostic() {
  const [diagnostic, setDiagnostic] = useState<ReturnType<typeof diagnoseWalletEnvironment> | null>(null)
  const [verification, setVerification] = useState<Awaited<ReturnType<typeof verifyWalletFix>> | null>(null)

  const runDiagnostic = () => {
    console.log("🔍 Running wallet diagnostic...")
    logWalletEnvironment()
    const result = diagnoseWalletEnvironment()
    setDiagnostic(result)
  }

  const runVerification = async () => {
    console.log("🧪 Running wallet fix verification...")
    const result = await verifyWalletFix()
    setVerification(result)
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Wallet Diagnostic Tool</h3>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button onClick={runDiagnostic}>
          Run Diagnostic
        </Button>
        <Button onClick={runVerification} variant="outline">
          <TestTube className="w-4 h-4 mr-2" />
          Verify Fix
        </Button>
      </div>

      {diagnostic && (
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Environment Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {diagnostic.hasEthereum ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span>Ethereum Available: {diagnostic.hasEthereum ? "Yes" : "No"}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span>Providers Found: {diagnostic.providers.length}</span>
              </div>
              
              {diagnostic.multipleProvidersDetected && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span>Multiple Providers Detected</span>
                </div>
              )}
              
              {diagnostic.phantomDetected && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span>Phantom Wallet Detected</span>
                </div>
              )}
            </div>
          </div>

          {diagnostic.providers.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Detected Wallets</h4>
              <div className="space-y-1">
                {diagnostic.providers.map((provider, index) => {
                  const walletName = getWalletName(provider)
                  const isPreferred = provider === diagnostic.preferredProvider
                  
                  return (
                    <div key={index} className={`flex items-center gap-2 p-2 rounded ${isPreferred ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Wallet className="w-4 h-4" />
                      <span>{walletName}</span>
                      {isPreferred && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Preferred
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {diagnostic.conflicts.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold mb-2 text-red-700 dark:text-red-300">Conflicts Detected</h4>
              <ul className="space-y-1">
                {diagnostic.conflicts.map((conflict, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{conflict}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diagnostic.recommendations.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Recommendations</h4>
              <ul className="space-y-1">
                {diagnostic.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {verification && (
        <div className="mt-6 space-y-4">
          <div className={`p-3 rounded-lg border ${
            verification.success 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <h4 className={`font-semibold mb-2 ${
              verification.success 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-red-700 dark:text-red-300'
            }`}>
              Fix Verification Results
            </h4>
            <p className={`text-sm mb-3 ${
              verification.success 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {verification.summary}
            </p>
            
            <div className="space-y-2">
              {verification.tests.map((test, index) => (
                <div key={index} className="flex items-center gap-2">
                  {test.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">{test.name}</span>
                  {test.message && (
                    <span className="text-xs text-muted-foreground">({test.message})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}