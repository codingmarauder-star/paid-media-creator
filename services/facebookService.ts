const API_VERSION = 'v20.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

interface ApiResponse {
    id?: string;
    error?: {
        message: string;
        type: string;
        code: number;
        fbtrace_id: string;
    };
    [key: string]: any;
}

const handleApiResponse = async (response: Response): Promise<ApiResponse> => {
    const data: ApiResponse = await response.json();
    if (!response.ok || data.error) {
        throw new Error(data.error?.message || `API request failed with status ${response.status}`);
    }
    return data;
};

// 1. Create Campaign
interface CreateCampaignArgs {
    accessToken: string;
    adAccountId: string;
    campaignName: string;
}
export const createCampaign = async ({ accessToken, adAccountId, campaignName }: CreateCampaignArgs): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/act_${adAccountId}/campaigns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            name: campaignName,
            objective: 'OUTCOME_TRAFFIC',
            status: 'PAUSED',
            special_ad_categories: ['NONE'],
        }),
    });
    return handleApiResponse(response);
};


// 2. Create Ad Set
interface CreateAdSetArgs {
    accessToken: string;
    adAccountId: string;
    campaignId: string;
    adSetName: string;
    dailyBudget: number; // in cents
    startTime: string; // ISO format
    endTime: string; // ISO format
}
export const createAdSet = async ({ accessToken, adAccountId, campaignId, adSetName, dailyBudget, startTime, endTime }: CreateAdSetArgs): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/act_${adAccountId}/adsets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            campaign_id: campaignId,
            name: adSetName,
            daily_budget: dailyBudget,
            start_time: startTime,
            end_time: endTime,
            billing_event: 'IMPRESSIONS',
            optimization_goal: 'LINK_CLICKS',
            bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
            targeting: {
                geo_locations: {
                    countries: ['US'],
                },
                age_min: 18,
                publisher_platforms: ['facebook', 'instagram'],
                device_platforms: ['mobile', 'desktop'],
            },
            status: 'PAUSED',
        }),
    });
    return handleApiResponse(response);
};

// 3. Create Ad Creative
interface CreateAdCreativeArgs {
    accessToken: string;
    adAccountId: string;
    pageId: string;
    creativeName: string;
    message: string;
    link: string;
    imageUrl: string;
    linkDescription: string;
    linkTitle: string;
}
export const createAdCreative = async ({ accessToken, adAccountId, pageId, creativeName, message, link, imageUrl, linkDescription, linkTitle }: CreateAdCreativeArgs): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/act_${adAccountId}/adcreatives`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            name: creativeName,
            object_story_spec: {
                page_id: pageId,
                link_data: {
                    link: link,
                    message: message,
                    picture: imageUrl,
                    name: linkTitle,
                    description: linkDescription,
                    // The call_to_action object is optional and has been a persistent source of "Invalid Parameter" errors.
                    // Removing it simplifies the request and creates a more standard ad creative. The entire ad will still be clickable.
                },
            },
        }),
    });
    return handleApiResponse(response);
};


// 4. Create Ad
interface CreateAdArgs {
    accessToken: string;
    adAccountId: string;
    adName: string;
    adSetId: string;
    creativeId: string;
}
export const createAd = async ({ accessToken, adAccountId, adName, adSetId, creativeId }: CreateAdArgs): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/act_${adAccountId}/ads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            name: adName,
            adset_id: adSetId,
            creative: {
                creative_id: creativeId,
            },
            status: 'PAUSED',
        }),
    });
    return handleApiResponse(response);
};