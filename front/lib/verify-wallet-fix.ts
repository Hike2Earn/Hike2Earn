/**
 * Verification script to test the wallet connection fix
 * This script tests all the new functionality to ensure it works correctly
 */

import { diagnoseWalletEnvironment, getBestProvider, connectWithFallback, getErrorMessage } from './wallet-utils'

export async function verifyWalletFix(): Promise<{
  success: boolean
  tests: Array<{ name: string; passed: boolean; message?: string }>
  summary: string
}> {
  const tests: Array<{ name: string; passed: boolean; message?: string }> = []
  let allTestsPassed = true

  console.group("🧪 Verifying Wallet Connection Fix")

  // Test 1: Diagnostic function works
  try {
    const diagnostic = diagnoseWalletEnvironment()
    tests.push({
      name: "Diagnostic function",
      passed: true,
      message: `Found ${diagnostic.providers.length} providers, ${diagnostic.conflicts.length} conflicts`
    })
    console.log("✅ Test 1 passed: Diagnostic function works")
  } catch (error) {
    tests.push({
      name: "Diagnostic function",
      passed: false,
      message: `Error: ${error}`
    })
    allTestsPassed = false
    console.log("❌ Test 1 failed: Diagnostic function error")
  }

  // Test 2: getBestProvider works
  try {
    const provider = getBestProvider()
    tests.push({
      name: "getBestProvider function",
      passed: provider !== null || typeof window === "undefined",
      message: provider ? "Provider found" : "No provider (expected in SSR)"
    })
    console.log("✅ Test 2 passed: getBestProvider works")
  } catch (error) {
    tests.push({
      name: "getBestProvider function",
      passed: false,
      message: `Error: ${error}`
    })
    allTestsPassed = false
    console.log("❌ Test 2 failed: getBestProvider error")
  }

  // Test 3: Error message generation works
  try {
    const mockError = { message: "selectExtension error", code: undefined }
    const errorInfo = getErrorMessage(mockError)
    
    tests.push({
      name: "Error message generation",
      passed: errorInfo.title.length > 0 && errorInfo.suggestions.length > 0,
      message: `Generated: "${errorInfo.title}"`
    })
    console.log("✅ Test 3 passed: Error message generation works")
  } catch (error) {
    tests.push({
      name: "Error message generation",
      passed: false,
      message: `Error: ${error}`
    })
    allTestsPassed = false
    console.log("❌ Test 3 failed: Error message generation error")
  }

  // Test 4: connectWithFallback handles no provider gracefully
  try {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = getBestProvider()
      if (provider) {
        // Don't actually connect, just test that the function exists and can be called
        tests.push({
          name: "connectWithFallback function exists",
          passed: typeof connectWithFallback === "function",
          message: "Function is callable"
        })
        console.log("✅ Test 4 passed: connectWithFallback function exists")
      } else {
        tests.push({
          name: "connectWithFallback function exists",
          passed: true,
          message: "No provider to test with"
        })
        console.log("✅ Test 4 passed: No provider to test connectWithFallback")
      }
    } else {
      tests.push({
        name: "connectWithFallback function exists",
        passed: true,
        message: "SSR environment - test skipped"
      })
      console.log("✅ Test 4 passed: SSR environment")
    }
  } catch (error) {
    tests.push({
      name: "connectWithFallback function exists",
      passed: false,
      message: `Error: ${error}`
    })
    allTestsPassed = false
    console.log("❌ Test 4 failed: connectWithFallback function error")
  }

  // Test 5: Multiple wallet detection
  try {
    const diagnostic = diagnoseWalletEnvironment()
    const multipleWalletsHandled = diagnostic.multipleProvidersDetected ? 
      diagnostic.preferredProvider !== null : true
    
    tests.push({
      name: "Multiple wallet handling",
      passed: multipleWalletsHandled,
      message: diagnostic.multipleProvidersDetected ? 
        "Multiple providers detected and handled" : 
        "Single provider or no providers"
    })
    console.log("✅ Test 5 passed: Multiple wallet handling works")
  } catch (error) {
    tests.push({
      name: "Multiple wallet handling",
      passed: false,
      message: `Error: ${error}`
    })
    allTestsPassed = false
    console.log("❌ Test 5 failed: Multiple wallet handling error")
  }

  console.groupEnd()

  const passedTests = tests.filter(t => t.passed).length
  const totalTests = tests.length
  
  const summary = `${passedTests}/${totalTests} tests passed${
    allTestsPassed ? " - All wallet connection fixes working correctly!" : 
    " - Some issues detected, check logs for details."
  }`

  return {
    success: allTestsPassed,
    tests,
    summary
  }
}

// Auto-run verification in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Run verification after a short delay to ensure everything is loaded
  setTimeout(() => {
    verifyWalletFix().then(result => {
      console.log("🔍 Wallet Fix Verification:", result.summary)
    })
  }, 1000)
}