// lib/testLibFunctions.ts - Test suite for all converted lib functions
import { Platform } from 'react-native';

// Import all lib functions to test
import { cn, capitalize, formatDate, formatTime, formatCurrency, truncateText, generateId, isValidEmail, debounce, throttle, safeJsonParse, isMobile, getPlatform } from './utils';
import { normalizeAvatarUrl, getAvailableAvatars, isValidAvatarUrl, getFallbackAvatarUrl, generateAvatarFromName, formatProfilePictureUrl } from './avatarUtils';
import { requestImagePermissions, pickImage, compressImage, validateImageFile, createThumbnail, validateImageDimensions, formatFileSize, isCameraAvailable } from './imageUtils';
import { checkBucketExists, uploadImage, deleteImage, getImageUrl, validateImageFile as validateStorageImageFile, testStorageConnection } from './storage';
import { authAPI, apiGet, apiPost, apiPatch, apiPut, apiDelete } from './api';
import { getMobilePlatformInfo, debugDatabaseConnection, debugUserProfile, debugTableExists, debugRLSPolicies, debugStorageAccess, debugNetworkConnectivity, generateMobileDebugReport, logMobileError, MobilePerformanceTimer } from './debug';

interface TestResult {
  function: string;
  success: boolean;
  error?: string;
  result?: any;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

/**
 * Test utils.ts functions
 */
export async function testUtilsFunctions(): Promise<TestSuite> {
  const results: TestResult[] = [];

  // Test cn function
  try {
    const result = cn({ color: 'red' }, { backgroundColor: 'blue' }, null, undefined);
    results.push({
      function: 'cn',
      success: typeof result === 'object' && result.color === 'red' && result.backgroundColor === 'blue',
      result
    });
  } catch (error) {
    results.push({
      function: 'cn',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test capitalize function
  try {
    const result = capitalize('hello world');
    results.push({
      function: 'capitalize',
      success: result === 'Hello world',
      result
    });
  } catch (error) {
    results.push({
      function: 'capitalize',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test formatDate function
  try {
    const result = formatDate(new Date('2023-01-15'));
    results.push({
      function: 'formatDate',
      success: typeof result === 'string' && result.includes('Jan'),
      result
    });
  } catch (error) {
    results.push({
      function: 'formatDate',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test formatCurrency function
  try {
    const result = formatCurrency(1234);
    results.push({
      function: 'formatCurrency',
      success: result === '$1,234',
      result
    });
  } catch (error) {
    results.push({
      function: 'formatCurrency',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test isValidEmail function
  try {
    const validEmail = isValidEmail('test@example.com');
    const invalidEmail = isValidEmail('invalid-email');
    results.push({
      function: 'isValidEmail',
      success: validEmail === true && invalidEmail === false,
      result: { validEmail, invalidEmail }
    });
  } catch (error) {
    results.push({
      function: 'isValidEmail',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test generateId function
  try {
    const result = generateId();
    results.push({
      function: 'generateId',
      success: typeof result === 'string' && result.length > 0,
      result
    });
  } catch (error) {
    results.push({
      function: 'generateId',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test platform functions
  try {
    const mobileResult = isMobile();
    const platformResult = getPlatform();
    results.push({
      function: 'platform functions',
      success: mobileResult === true && typeof platformResult === 'string',
      result: { isMobile: mobileResult, platform: platformResult }
    });
  } catch (error) {
    results.push({
      function: 'platform functions',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  const passedTests = results.filter(r => r.success).length;
  return {
    name: 'Utils Functions',
    results,
    totalTests: results.length,
    passedTests,
    failedTests: results.length - passedTests
  };
}

/**
 * Test avatarUtils.ts functions
 */
export async function testAvatarUtilsFunctions(): Promise<TestSuite> {
  const results: TestResult[] = [];

  // Test normalizeAvatarUrl function
  try {
    const result1 = normalizeAvatarUrl(null);
    const result2 = normalizeAvatarUrl('https://example.com/image.jpg');
    const result3 = normalizeAvatarUrl('/Avatars/Avatar1.png');
    results.push({
      function: 'normalizeAvatarUrl',
      success: result1.includes('placeholder') && result2 === 'https://example.com/image.jpg' && result3.includes('placeholder'),
      result: { null: result1, external: result2, local: result3 }
    });
  } catch (error) {
    results.push({
      function: 'normalizeAvatarUrl',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test getAvailableAvatars function
  try {
    const result = getAvailableAvatars();
    results.push({
      function: 'getAvailableAvatars',
      success: Array.isArray(result) && result.length === 16,
      result: `${result.length} avatars`
    });
  } catch (error) {
    results.push({
      function: 'getAvailableAvatars',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test generateAvatarFromName function
  try {
    const result = generateAvatarFromName('John Doe');
    results.push({
      function: 'generateAvatarFromName',
      success: result.includes('text=J'),
      result
    });
  } catch (error) {
    results.push({
      function: 'generateAvatarFromName',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  const passedTests = results.filter(r => r.success).length;
  return {
    name: 'Avatar Utils Functions',
    results,
    totalTests: results.length,
    passedTests,
    failedTests: results.length - passedTests
  };
}

/**
 * Test imageUtils.ts functions
 */
export async function testImageUtilsFunctions(): Promise<TestSuite> {
  const results: TestResult[] = [];

  // Test isCameraAvailable function
  try {
    const result = isCameraAvailable();
    results.push({
      function: 'isCameraAvailable',
      success: typeof result === 'boolean',
      result
    });
  } catch (error) {
    results.push({
      function: 'isCameraAvailable',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test formatFileSize function
  try {
    const result = formatFileSize(1024);
    results.push({
      function: 'formatFileSize',
      success: result === '1 KB',
      result
    });
  } catch (error) {
    results.push({
      function: 'formatFileSize',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test validateImageFile function (mock data)
  try {
    const mockImage = {
      uri: 'test://image.jpg',
      type: 'image/jpeg',
      name: 'test.jpg',
      size: 1024
    };
    const result = validateImageFile(mockImage);
    results.push({
      function: 'validateImageFile',
      success: result.valid === true,
      result
    });
  } catch (error) {
    results.push({
      function: 'validateImageFile',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  const passedTests = results.filter(r => r.success).length;
  return {
    name: 'Image Utils Functions',
    results,
    totalTests: results.length,
    passedTests,
    failedTests: results.length - passedTests
  };
}

/**
 * Test debug.ts functions
 */
export async function testDebugFunctions(): Promise<TestSuite> {
  const results: TestResult[] = [];

  // Test getMobilePlatformInfo function
  try {
    const result = getMobilePlatformInfo();
    results.push({
      function: 'getMobilePlatformInfo',
      success: typeof result === 'object' && typeof result.platform === 'string',
      result
    });
  } catch (error) {
    results.push({
      function: 'getMobilePlatformInfo',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test logMobileError function
  try {
    logMobileError('test operation', new Error('test error'), { testContext: true });
    results.push({
      function: 'logMobileError',
      success: true,
      result: 'Logged successfully'
    });
  } catch (error) {
    results.push({
      function: 'logMobileError',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test MobilePerformanceTimer
  try {
    const timer = new MobilePerformanceTimer('test operation');
    setTimeout(() => {
      const duration = timer.end();
      results.push({
        function: 'MobilePerformanceTimer',
        success: typeof duration === 'number' && duration >= 0,
        result: `${duration}ms`
      });
    }, 10);
  } catch (error) {
    results.push({
      function: 'MobilePerformanceTimer',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  const passedTests = results.filter(r => r.success).length;
  return {
    name: 'Debug Functions',
    results,
    totalTests: results.length,
    passedTests,
    failedTests: results.length - passedTests
  };
}

/**
 * Run all lib function tests
 */
export async function runAllLibTests(): Promise<{
  testSuites: TestSuite[];
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  successRate: number;
}> {
  console.log('🧪 Running comprehensive lib functions test suite...');

  const testSuites: TestSuite[] = [];

  // Run all test suites
  testSuites.push(await testUtilsFunctions());
  testSuites.push(await testAvatarUtilsFunctions());
  testSuites.push(await testImageUtilsFunctions());
  testSuites.push(await testDebugFunctions());

  // Calculate totals
  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
  const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

  console.log('📊 Test Results Summary:');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${totalPassed}`);
  console.log(`   Failed: ${totalFailed}`);
  console.log(`   Success Rate: ${successRate.toFixed(1)}%`);

  testSuites.forEach(suite => {
    console.log(`\n📋 ${suite.name}:`);
    console.log(`   Tests: ${suite.totalTests}, Passed: ${suite.passedTests}, Failed: ${suite.failedTests}`);

    // Log failed tests
    suite.results.filter(r => !r.success).forEach(result => {
      console.log(`   ❌ ${result.function}: ${result.error}`);
    });
  });

  return {
    testSuites,
    totalTests,
    totalPassed,
    totalFailed,
    successRate
  };
}

/**
 * Quick smoke test for all lib functions
 */
export async function quickSmokeTest(): Promise<boolean> {
  try {
    console.log('🔥 Running quick smoke test for lib functions...');

    // Test basic functionality without external dependencies
    const styleObj = cn({ color: 'red' }, { backgroundColor: 'blue' });
    const capitalizedText = capitalize('hello');
    const email = isValidEmail('test@example.com');
    const id = generateId();
    const avatar = generateAvatarFromName('John');
    const platform = getMobilePlatformInfo();

    const allFunctionsWork =
      typeof styleObj === 'object' &&
      capitalizedText === 'Hello' &&
      email === true &&
      typeof id === 'string' &&
      typeof avatar === 'string' &&
      typeof platform === 'object';

    console.log(allFunctionsWork ? '✅ Smoke test passed' : '❌ Smoke test failed');
    return allFunctionsWork;
  } catch (error) {
    console.error('❌ Smoke test failed with error:', error);
    return false;
  }
}