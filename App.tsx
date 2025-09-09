import React, { useState, useCallback } from 'react';
import CredentialInput from './components/CredentialInput';
import ProgressLog from './components/ProgressLog';
import { createCampaign, createAdSet, createAdCreative, createAd } from './services/facebookService';
import type { Credentials, LogMessage } from './types';
import { LogStatus } from './types';

const getDurationInDays = (startDateStr: string, endDateStr: string): number => {
    try {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        // Normalize dates to midnight to compare days accurately
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (endDate < startDate) return 1;

        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the start day
        
        return Math.max(1, diffDays);
    } catch (e) {
        // Fallback if date is invalid
        return 1;
    }
};


function App() {
  const [credentials, setCredentials] = useState<Credentials>({
    accessToken: '',
    adAccountId: '',
    pageId: '',
  });
  const [logMessages, setLogMessages] = useState<LogMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const addLog = (text: string, status: LogStatus, data?: any) => {
    setLogMessages(prev => [...prev, { text, status, data }]);
  };

  const handleCreateCampaign = useCallback(async () => {
    setIsLoading(true);
    setLogMessages([]);
    addLog('Starting dummy campaign creation process...', LogStatus.INFO);

    const missingCredentials = Object.entries(credentials)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
    
    if (missingCredentials.length > 0) {
        const missingFieldNames = missingCredentials.map(c => {
            if (c === 'adAccountId') return 'Ad Account ID';
            if (c === 'accessToken') return 'Access Token';
            if (c === 'pageId') return 'Page ID';
            return c;
        });

        addLog(`Validation failed. Missing fields: ${missingFieldNames.join(', ')}`, LogStatus.ERROR);
        setIsLoading(false);
        return;
    }

    try {
      const { accessToken, adAccountId, pageId } = credentials;

      const dummyData = {
          artist: 'The Cool Rockers',
          budget: 150, // $150
          startDate: '2025-11-01T10:00:00-0500',
          endDate: '2025-11-08T23:59:59-0500',
          copy: 'Check out the new single from The Cool Rockers!',
          copy2ndLine: 'Listen now on all streaming platforms.',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Big_Pine_BC_Canada.jpg/1200px-Big_Pine_BC_Canada.jpg', // Use reliable, static, direct-link image
          linkUrl: 'https://www.facebook.com' // Use standard, crawlable URL
      };
      
      addLog('Using hardcoded dummy data for campaign.', LogStatus.INFO, dummyData);

      // Calculate budget and dates
      const durationDays = getDurationInDays(dummyData.startDate, dummyData.endDate);
      const dailyBudget = Math.round((dummyData.budget / durationDays) * 100); // In cents
      addLog(`Calculated daily budget: $${(dailyBudget / 100).toFixed(2)} over ${durationDays} days.`, LogStatus.INFO);

      // --- Real Facebook API Calls ---
      addLog('Connecting to Facebook Marketing API...', LogStatus.INFO);
      
      // 1. Create Campaign
      const campaignName = `${dummyData.artist} Dummy Campaign`;
      addLog(`[Step 1/4] Creating campaign: "${campaignName}"...`, LogStatus.LOADING);
      const campaign = await createCampaign({ accessToken, adAccountId, campaignName });
      addLog(`Campaign created with ID: ${campaign.id}`, LogStatus.SUCCESS);
      
      // 2. Create Ad Set
      const adSetName = `${dummyData.artist} Dummy Ad Set`;
      addLog(`[Step 2/4] Creating ad set: "${adSetName}"...`, LogStatus.LOADING);
      const adSet = await createAdSet({
          accessToken,
          adAccountId,
          campaignId: campaign.id!,
          adSetName,
          dailyBudget,
          startTime: dummyData.startDate,
          endTime: dummyData.endDate,
      });
      addLog(`Ad Set created with ID: ${adSet.id}`, LogStatus.SUCCESS);

      // 3. Create Ad Creative
      const creativeName = `${dummyData.artist} Dummy Creative`;
      addLog(`[Step 3/4] Creating ad creative: "${creativeName}"...`, LogStatus.LOADING);
      const creative = await createAdCreative({
          accessToken,
          adAccountId,
          pageId: pageId,
          creativeName,
          message: dummyData.copy,
          link: dummyData.linkUrl,
          imageUrl: dummyData.imageUrl,
          linkDescription: dummyData.copy2ndLine,
          linkTitle: dummyData.artist,
      });
      addLog(`Ad Creative created with ID: ${creative.id}`, LogStatus.SUCCESS);

      // 4. Create Ad
      const adName = `${dummyData.artist} Dummy Ad`;
      addLog(`[Step 4/4] Creating final ad: "${adName}"...`, LogStatus.LOADING);
      const ad = await createAd({
          accessToken,
          adAccountId,
          adName,
          adSetId: adSet.id!,
          creativeId: creative.id!,
      });
      addLog(`Ad created with ID: ${ad.id}`, LogStatus.SUCCESS);
      
      addLog('Process complete. Campaign is PAUSED and ready for review in Ads Manager.', LogStatus.SUCCESS);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      addLog(`Error: ${errorMessage}`, LogStatus.ERROR, error);
      addLog('Campaign creation failed. Please check your credentials, permissions, and campaign data.', LogStatus.INFO);
    } finally {
      setIsLoading(false);
    }
  }, [credentials]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">Facebook Campaign Creator</h1>
          <p className="mt-2 text-slate-600">Enter your API credentials and click the button to create a dummy campaign.</p>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">1. Your Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CredentialInput name="accessToken" label="Facebook Access Token" value={credentials.accessToken} onChange={handleCredentialChange} placeholder="Enter Access Token" type="password" />
            <CredentialInput name="adAccountId" label="Ad Account ID (without 'act_')" value={credentials.adAccountId} onChange={handleCredentialChange} placeholder="Enter Ad Account ID" />
            <div className="md:col-span-2">
              <CredentialInput name="pageId" label="Facebook Page ID" value={credentials.pageId} onChange={handleCredentialChange} placeholder="Enter Page ID" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Your Access Token requires <code className="bg-slate-200 px-1 rounded">ads_management</code> permission. Credentials are not stored.
          </p>
        </div>
        
        <button
          onClick={handleCreateCampaign}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Creating Campaign...' : 'Create Dummy Campaign'}
        </button>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">2. Progress Log</h2>
          <ProgressLog messages={logMessages} />
        </div>
        
        <p className="text-xs text-slate-500 text-center">This tool interacts directly with the Facebook Marketing API. All campaigns are created in a 'PAUSED' state for review.</p>
      </div>
    </div>
  );
}

export default App;