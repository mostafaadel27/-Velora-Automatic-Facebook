/**
 * Facebook Graph API Helper Functions
 * Used by the webhook handler to reply to comments and send DMs.
 */

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

/**
 * Reply to a comment on a Facebook post.
 */
export async function replyToComment(
  commentId: string,
  message: string,
  pageAccessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${GRAPH_API_BASE}/${commentId}/comments`;
    console.log(`[FB_REPLY] POST ${url.replace(pageAccessToken, '***')}`);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        access_token: pageAccessToken,
      }),
    });

    const data = await res.json();

    if (data.error) {
      console.error("[FB_REPLY_ERROR]", JSON.stringify(data.error));
      return { success: false, error: `${data.error.message} (code: ${data.error.code}, subcode: ${data.error.error_subcode || 'none'})` };
    }

    console.log(`[FB_REPLY_SUCCESS] Replied to comment ${commentId}, response ID: ${data.id}`);
    return { success: true };
  } catch (error) {
    console.error("[FB_REPLY_EXCEPTION]", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send a private message (DM) to the person who commented.
 * Uses the Page's "private_replies" feature (comment_id based).
 * Falls back to Messenger Send API if private_replies fails.
 */
export async function sendPrivateReply(
  commentId: string,
  message: string,
  pageAccessToken: string,
  commenterId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Attempt 1: private_replies endpoint
    const url = `${GRAPH_API_BASE}/${commentId}/private_replies`;
    console.log(`[FB_DM] POST private_replies for comment ${commentId}`);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        access_token: pageAccessToken,
      }),
    });

    const data = await res.json();

    if (!data.error) {
      console.log(`[FB_DM_SUCCESS] Sent private reply for comment ${commentId}`);
      return { success: true };
    }

    console.error("[FB_DM_ERROR]", JSON.stringify(data.error));

    // Attempt 2: Fallback to Messenger Send API if we have the commenter's ID
    if (commenterId) {
      console.log(`[FB_DM] private_replies failed (code: ${data.error.code}), trying Send API with PSID: ${commenterId}`);
      const sendResult = await sendDirectMessage(commenterId, message, pageAccessToken);
      if (sendResult.success) {
        console.log(`[FB_DM_FALLBACK_SUCCESS] Sent via Send API to ${commenterId}`);
        return { success: true };
      }
      console.error(`[FB_DM_FALLBACK_FAILED]`, sendResult.error);
      return { success: false, error: `private_replies failed: ${data.error.message}. Send API also failed: ${sendResult.error}` };
    }

    return { success: false, error: `${data.error.message} (code: ${data.error.code})` };
  } catch (error) {
    console.error("[FB_DM_EXCEPTION]", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Subscribe a Facebook Page to receive webhook events for this app.
 * THIS IS CRITICAL — without this call, Facebook will NOT send any
 * webhook events (comments, messages) for this page.
 */
export async function subscribePageToApp(
  pageId: string,
  pageAccessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${GRAPH_API_BASE}/${pageId}/subscribed_apps`;
    console.log(`[FB_SUBSCRIBE] Subscribing page ${pageId} to app webhooks...`);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscribed_fields: "feed,messages,messaging_postbacks",
        access_token: pageAccessToken,
      }),
    });

    const data = await res.json();

    if (data.error) {
      console.error("[FB_SUBSCRIBE_ERROR]", JSON.stringify(data.error));
      return { success: false, error: `${data.error.message} (code: ${data.error.code})` };
    }

    console.log(`[FB_SUBSCRIBE_SUCCESS] Page ${pageId} subscribed! Response:`, data);
    return { success: true };
  } catch (error) {
    console.error("[FB_SUBSCRIBE_EXCEPTION]", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Check current webhook subscriptions for a page.
 */
export async function getPageSubscriptions(
  pageId: string,
  pageAccessToken: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const url = `${GRAPH_API_BASE}/${pageId}/subscribed_apps?access_token=${pageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("[FB_SUBSCRIPTIONS_ERROR]", JSON.stringify(data.error));
      return { success: false, error: data.error.message };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("[FB_SUBSCRIPTIONS_EXCEPTION]", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get the parent post ID from a comment ID.
 */
export async function getCommentDetails(
  commentId: string,
  pageAccessToken: string
): Promise<{ postId: string; message: string; fromId: string; fromName: string } | null> {
  try {
    const url = `${GRAPH_API_BASE}/${commentId}?fields=message,from,parent,object&access_token=${pageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("[FB_COMMENT_DETAILS_ERROR]", JSON.stringify(data.error));
      return null;
    }

    return {
      postId: data.object?.id || "",
      message: data.message || "",
      fromId: data.from?.id || "",
      fromName: data.from?.name || "",
    };
  } catch (error) {
    console.error("[FB_COMMENT_DETAILS_EXCEPTION]", error);
    return null;
  }
}

/**
 * Get basic info about a person from their PSID.
 * Requires page access token.
 */
export async function getUserProfile(
  psid: string,
  pageAccessToken: string
): Promise<{ firstName?: string; lastName?: string; profilePic?: string } | null> {
  try {
    const url = `${GRAPH_API_BASE}/${psid}?fields=first_name,last_name,profile_pic,picture&access_token=${pageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("[FB_USER_PROFILE_ERROR]", JSON.stringify(data.error));
      return null;
    }

    return {
      firstName: data.first_name,
      lastName: data.last_name,
      profilePic: data.profile_pic || data.picture?.data?.url || null,
    };
  } catch (error) {
    console.error("[FB_USER_PROFILE_EXCEPTION]", error);
    return null;
  }
}

/**
 * Fetch all conversations for a Facebook Page.
 */
export async function getConversations(
  pageAccessToken: string
): Promise<any[]> {
  try {
    const url = `${GRAPH_API_BASE}/me/conversations?fields=id,updated_time,participants{id,name,picture},messages.limit(1){message,created_time,from,to}&access_token=${pageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("[FB_CONVERSATIONS_ERROR]", JSON.stringify(data.error));
      return [];
    }

    return data.data || [];
  } catch (error) {
    console.error("[FB_CONVERSATIONS_EXCEPTION]", error);
    return [];
  }
}

/**
 * Fetch messages for a specific conversation.
 */
export async function getConversationMessages(
  conversationId: string,
  pageAccessToken: string
): Promise<any[]> {
  try {
    const url = `${GRAPH_API_BASE}/${conversationId}/messages?fields=id,created_time,message,from,to&limit=50&access_token=${pageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("[FB_MESSAGES_ERROR]", JSON.stringify(data.error));
      return [];
    }

    return data.data || [];
  } catch (error) {
    console.error("[FB_MESSAGES_EXCEPTION]", error);
    return [];
  }
}

/**
 * Send a direct message (DM) to a PSID.
 */
export async function sendDirectMessage(
  psid: string,
  message: string,
  pageAccessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${GRAPH_API_BASE}/me/messages?access_token=${pageAccessToken}`;
    console.log(`[FB_SEND_MSG] Sending to PSID: ${psid}`);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: psid },
        message: { text: message },
      }),
    });
    const data = await res.json();

    if (data.error) {
      console.error("[FB_SEND_MSG_ERROR]", JSON.stringify(data.error));
      return { success: false, error: `${data.error.message} (code: ${data.error.code})` };
    }

    console.log(`[FB_SEND_MSG_SUCCESS] Message sent to ${psid}`);
    return { success: true };
  } catch (error) {
    console.error("[FB_SEND_MSG_EXCEPTION]", error);
    return { success: false, error: String(error) };
  }
}
