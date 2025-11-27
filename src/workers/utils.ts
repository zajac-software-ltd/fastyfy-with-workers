/* eslint-disable @typescript-eslint/no-unused-vars */
export function safe<T>(promise: Promise<T>) {
  return promise.catch(error => {
    return undefined;
  });
}


export async function testHeavyAsyncOperation(
  duration: number = 5000,
  shouldFail: boolean = false,
  failureRate: number = 0.2,
  payload:unknown = {}
): Promise<{ 
  success: boolean; 
  processingTime: number; 
  result?: string; 
  error?: string;
  payload?: unknown 
}> {
  const startTime = Date.now();
  
  try {
    // Simulate CPU-intensive work with periodic yields
    const iterations = 2;
    const iterationTime = duration / iterations;
    
    for (let i = 0; i < iterations; i++) {
      // Simulate some CPU work
      let sum = 0;
      for (let j = 0; j < 1000000; j++) {
        sum += Math.sqrt(j);
      }
      
      // Yield to event loop
      await new Promise(resolve => setTimeout(resolve, iterationTime));
      
      console.log(`Heavy operation progress: ${((i + 1) / iterations * 100).toFixed(0)}%`);
    }
    
    // // Randomly fail if configured
    // if (shouldFail && Math.random() < failureRate) {
    //   throw new Error('Simulated random failure during heavy processing');
    // }
    
    const processingTime = Date.now() - startTime;
    
    
    return {
      success: true,
      processingTime,
      result: `Heavy operation completed successfully after ${processingTime}ms`,
      payload
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    return {
      success: false,
      processingTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Simulates an API call or database operation
 */
export async function testAsyncApiCall(
  delay: number = 2000,
  data: any = {}
): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return {
    timestamp: new Date().toISOString(),
    processed: true,
    originalData: data,
    randomValue: Math.random()
  };
}
