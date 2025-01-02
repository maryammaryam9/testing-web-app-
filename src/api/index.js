import { handleResponseError } from "./apis/errorHandling/index";
import { authAxiosInstance, pipelineAxiosInstance } from "./apis/axiosInstance";
import config from "../utils/config";

const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

const getAxiosInstance = (url) => {
  if (url?.startsWith(config.authUrl)) return authAxiosInstance;
  else if (url?.startsWith(config.pipelineUrl)) return pipelineAxiosInstance;
};

export const getAPI = async (url, tokenRequired = false) => {
  const access_token = getAccessToken();
  let response = {
    error: false,
    message: "Something went wrong",
    data: "",
  };
  let configBody = tokenRequired ? 
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'endpoint': '/api/v1/openresearch/chat'
    },
    timeout: 100000,
  }
  : {
    method: 'GET',
    headers: {
      'endpoint': '/api/v1/openresearch/chat'
    },
    timeout: 100000,
  }
  await fetch(url, configBody).then(res => res.json())
  .then(data => {
    response.data = data;
    response.error = false;
    response.message = 'Success';
  })
  .catch(error => {
    response.error = true
  });
  return response;
};

export const postAPI = async (url, body, tokenRequired = false) => {
 const access_token = getAccessToken();
  let response = {
    error: false,
    message: "Something went wrong",
    data: "",
    headers:{}
  };
  let configBody = tokenRequired ? 
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    },
    body: body,
  }
  : {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body,
  }
  await fetch(url, configBody)
  .then(res => { response.headers = res.headers; // Capture the response headers
  return res.json(); // Parse the body as JSON 
  })
  .then(data => {
    response.data = data;
    response.error = false;
    response.message = 'Success';
  })
  .catch(error => {
    response.error = true
  });
  return response;
};

export const postAPIOpenReserch = async (url, body,chatId) => {
  const access_token = getAccessToken();
   let response = {
     error: false,
     message: "Something went wrong",
     data: "",
     headers:{}
   };
   let configBody = (chatId !=null && chatId!="") ? 
   {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${access_token}`,
       'chat-id':chatId
     },
     body: body,
   }
   : {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    },
     body: body,
   }
   await fetch(url, configBody)
   .then(res => { response.headers = res.headers; // Capture the response headers
   return res.json(); // Parse the body as JSON 
   })
   .then(data => {
     response.data = data;
     response.error = false;
     response.message = 'Success';
   })
   .catch(error => {
     response.error = true
   });
   return response;
 };

export const putAPI = async (url, body) => {
  const axiosInstance = getAxiosInstance(url);
  try {
    const access_token = getAccessToken();
    const config = {
      headers: {
        Authorization: access_token,
      },
    };
    const response = await axiosInstance.put(url, body, config);
    const result = handleResponseError(response);
    if (result.error) {
      return { error: true, message: result.message };
    }
    return { data: result, error: false };
  } catch (res) {
    if (res && res.response && res.response.data && res.response.data.message) {
      return { error: true, message: res.response.data.message };
    }
    return { error: true, message: "Something went wrong" };
  } finally {
  }
};

export const deleteAPI = async (url, body) => {
  const axiosInstance = getAxiosInstance(url);
  try {
    const access_token = getAccessToken();
    const config = {
      headers: {
        Authorization: access_token,
      },
      data: body,
    };
    const response = await axiosInstance.delete(url, config);
    const result = handleResponseError(response);
    if (result.error) {
      return { error: true, message: result.message };
    }
    return { data: result, error: false };
  } catch (res) {
    if (res && res.response && res.response.data && res.response.data.message) {
      return { error: true, message: res.response.data.message };
    }
    return { error: true, message: "Something went wrong" };
  } finally {
  }
};

export const getAPIStream = async (url, onMessage) => {
  try {
    const access_token = getAccessToken();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: access_token,
      },
    });

    if (!response.body) {
      throw new Error("ReadableStream not supported in this browser.");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let splitData = buffer.split("data:");
      buffer = splitData.pop();

      for (let chunk of splitData) {
        const jsonData = chunk.trim();
        if (jsonData) {
          try {
            const parsedData = JSON.parse(jsonData);
            await new Promise((resolve) => setTimeout(resolve, 800));
            onMessage(parsedData);
          } catch (e) {
            console.error("Error parsing JSON data:", e);
          }
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsedData = JSON.parse(buffer.trim());
        onMessage(parsedData);
      } catch (e) {
        console.error("Error parsing final JSON data:", e);
      }
    }

    return { error: false };
  } catch (res) {
    if (res?.message) {
      if (res?.status === 401) {
        window.location.reload();
      }
      return {
        error: true,
        message: res.message,
        code: res.status,
      };
    }

    return {
      error: true,
      message: "Something went wrong",
      code: res?.status,
    };
  }
};

export const postAPIStream = async (url, data, onMessage, signal, onShimmering, onComplete) => {
  try {
    const access_token = getAccessToken();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: access_token,
      },
      body: JSON.stringify(data),
    });
    if (!response.body) {
      throw new Error("ReadableStream not supported in this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";
    let isCompleted = false;

    while (!isCompleted) {
      if (signal.aborted) {
        reader.cancel();
        break;
      }
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let splitData = buffer.split("\n\n");
      buffer = splitData.pop();

      for (let chunk of splitData) {
        if (chunk.startsWith("data: ")) {
          const jsonData = chunk.substring(6).trim();
          try {
            const parsedData = JSON.parse(jsonData);
            if (parsedData.status === "STARTED") {
              if (signal.aborted) {
                onShimmering("");
                reader.cancel();
                break;
              } else {
                await new Promise((resolve) => setTimeout(resolve, 50));
                onShimmering(parsedData);
              }
            } else {
              await new Promise((resolve) => setTimeout(resolve, 5));
              onMessage(parsedData);

              if (parsedData.status === "COMPLETED" || signal.aborted) {
                isCompleted = true;
                reader.cancel();
                break;
              }
            }
          } catch (e) {
            console.error("Error parsing JSON data:", e);
          }
        }
      }
    }
  } catch (error) {
    // onError(error);
  }
};
