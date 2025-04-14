// cozeApi.js
// Service for interacting with the Coze API

/**
 * Configuration for the Coze API
 */
const COZE_CONFIG = {
  baseUrl: 'https://www.coze.cn/open/api/v1', // Coze API base URL
  apiKey: '', // Your Coze API key (to be filled by the user)
  botId: '', // Your Coze bot ID (to be filled by the user)
};

/**
 * Call a Coze workflow with the provided input
 * @param {string} workflowId - The ID of the workflow to execute
 * @param {Object} input - The input parameters for the workflow
 * @param {Function} onSuccess - Callback function when the API call succeeds
 * @param {Function} onError - Callback function when the API call fails
 * @param {Function} onComplete - Callback function when the API call completes (success or failure)
 */
function callWorkflow(workflowId, input, onSuccess, onError, onComplete) {
  if (!COZE_CONFIG.apiKey) {
    const error = new Error('Coze API key is not configured');
    console.error(error);
    if (onError) onError(error);
    if (onComplete) onComplete();
    return;
  }

  if (!workflowId) {
    const error = new Error('Workflow ID is required');
    console.error(error);
    if (onError) onError(error);
    if (onComplete) onComplete();
    return;
  }

  // Prepare the request data
  const requestData = {
    workflow_id: workflowId,
    input: input || {},
  };

  // Make the API request
  wx.request({
    url: `${COZE_CONFIG.baseUrl}/workflow/execute`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${COZE_CONFIG.apiKey}`
    },
    data: requestData,
    success: function(res) {
      console.log('Coze workflow executed successfully:', res.data);
      if (onSuccess) onSuccess(res.data);
    },
    fail: function(err) {
      console.error('Failed to execute Coze workflow:', err);
      if (onError) onError(err);
    },
    complete: function() {
      if (onComplete) onComplete();
    }
  });
}

/**
 * Call a Coze workflow with streaming response
 * @param {string} workflowId - The ID of the workflow to execute
 * @param {Object} input - The input parameters for the workflow
 * @param {Function} onData - Callback function for each chunk of data received
 * @param {Function} onError - Callback function when the API call fails
 * @param {Function} onComplete - Callback function when the API call completes
 */
function streamWorkflow(workflowId, input, onData, onError, onComplete) {
  if (!COZE_CONFIG.apiKey) {
    const error = new Error('Coze API key is not configured');
    console.error(error);
    if (onError) onError(error);
    if (onComplete) onComplete();
    return;
  }

  if (!workflowId) {
    const error = new Error('Workflow ID is required');
    console.error(error);
    if (onError) onError(error);
    if (onComplete) onComplete();
    return;
  }

  // Prepare the request data
  const requestData = {
    workflow_id: workflowId,
    input: input || {},
    stream: true
  };

  // Make the API request with streaming
  const requestTask = wx.request({
    url: `${COZE_CONFIG.baseUrl}/workflow/execute`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
      'Accept': 'text/event-stream'
    },
    data: requestData,
    responseType: 'text',
    success: function(res) {
      // Handle streaming response
      if (res.statusCode === 200 && res.data) {
        const lines = res.data.split('\\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.substring(6));
              if (onData) onData(jsonData);
            } catch (e) {
              console.error('Error parsing streaming data:', e);
              if (onData) onData(line.substring(6));
            }
          }
        }
      }
    },
    fail: function(err) {
      console.error('Failed to execute Coze workflow with streaming:', err);
      if (onError) onError(err);
    },
    complete: function() {
      if (onComplete) onComplete();
    }
  });

  // Return the request task so it can be aborted if needed
  return requestTask;
}

/**
 * Chat with a Coze bot
 * @param {string} message - The user message to send to the bot
 * @param {Function} onSuccess - Callback function when the API call succeeds
 * @param {Function} onError - Callback function when the API call fails
 * @param {Function} onComplete - Callback function when the API call completes
 */
function chatWithBot(message, onSuccess, onError, onComplete) {
  if (!COZE_CONFIG.apiKey) {
    const error = new Error('Coze API key is not configured');
    console.error(error);
    if (onError) onError(error);
    if (onComplete) onComplete();
    return;
  }

  if (!COZE_CONFIG.botId) {
    const error = new Error('Bot ID is not configured');
    console.error(error);
    if (onError) onError(error);
    if (onComplete) onComplete();
    return;
  }

  // Prepare the request data
  const requestData = {
    bot_id: COZE_CONFIG.botId,
    additional_messages: [
      {
        role: 'user',
        content: message,
        content_type: 'text'
      }
    ]
  };

  // Make the API request
  wx.request({
    url: `${COZE_CONFIG.baseUrl}/chat/create`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${COZE_CONFIG.apiKey}`
    },
    data: requestData,
    success: function(res) {
      console.log('Coze chat created successfully:', res.data);
      if (onSuccess) onSuccess(res.data);
    },
    fail: function(err) {
      console.error('Failed to create Coze chat:', err);
      if (onError) onError(err);
    },
    complete: function() {
      if (onComplete) onComplete();
    }
  });
}

/**
 * Set the Coze API configuration
 * @param {Object} config - The configuration object
 */
function setConfig(config) {
  if (config.apiKey) COZE_CONFIG.apiKey = config.apiKey;
  if (config.botId) COZE_CONFIG.botId = config.botId;
  if (config.baseUrl) COZE_CONFIG.baseUrl = config.baseUrl;
}

/**
 * Set workflow IDs for different style types
 * @param {Object} workflowIds - Object containing workflow IDs for different style types
 */
function setWorkflowIds(workflowIds) {
  if (workflowIds.photo) wx.setStorageSync('photo_workflow_id', workflowIds.photo);
  if (workflowIds.national) wx.setStorageSync('national_workflow_id', workflowIds.national);
  if (workflowIds.face) wx.setStorageSync('face_workflow_id', workflowIds.face);
  if (workflowIds.default) wx.setStorageSync('default_workflow_id', workflowIds.default);
}

/**
 * Get workflow ID for a specific style type
 * @param {string} styleType - The style type (photo, national, face)
 * @returns {string} The workflow ID for the specified style type
 */
function getWorkflowId(styleType) {
  let workflowId = '';
  
  switch(styleType) {
    case 'photo':
      workflowId = wx.getStorageSync('photo_workflow_id') || '';
      break;
    case 'national':
      workflowId = wx.getStorageSync('national_workflow_id') || '';
      break;
    case 'face':
      workflowId = wx.getStorageSync('face_workflow_id') || '';
      break;
    default:
      workflowId = wx.getStorageSync('default_workflow_id') || '';
  }
  
  // If no workflow ID is set for this type, use the default one
  if (!workflowId) {
    workflowId = wx.getStorageSync('default_workflow_id') || '';
  }
  
  return workflowId;
}

module.exports = {
  callWorkflow,
  streamWorkflow,
  chatWithBot,
  setConfig,
  setWorkflowIds,
  getWorkflowId,
  COZE_CONFIG
};
