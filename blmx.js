const bubbleWorkshopState={originalShadow:{me:'0 0 0 2px #ffffff, 0 0 0 4px #5D4037, inset 3px 3px 2px rgba(128, 116, 111, 0.15), 6px 6px 4px rgba(128, 116, 111, 0.3)',them:'0 0 0 2px #ffffff, 0 0 0 4px #B5C4C3, inset 3px 3px 2px rgba(181, 196, 195, 0.35), 3px 3px 8px rgba(181, 196, 195, 0.6)'},lastSelectedColor:{me:'#80746F',them:'#B5C4C3'}};let globalAudio=new Audio();let isDraggingProgress=!1;let currentSong={title:"樱华坠梦",artist:"潮生组",src:"https://files.catbox.moe/2o8wfv.mp3",lrc:"[00:00.00]暂无歌词\n[00:05.00]请点击右上角...添加歌词"};function showDialog(options){return new Promise(resolve=>{const modal=document.getElementById('custom-dialog-modal');const textEl=document.getElementById('dialog-text');const inputEl=document.getElementById('dialog-input');const buttonsEl=document.getElementById('dialog-buttons');inputEl.style.display='none';buttonsEl.innerHTML='';textEl.innerHTML=options.text||'';const cleanupAndResolve=(value)=>{modal.style.display='none';buttonsEl.innerHTML='';resolve(value)};if(options.mode==='prompt'){inputEl.style.display='block';inputEl.value=options.defaultValue||'';inputEl.placeholder=options.placeholder||'';const okBtn=document.createElement('button');okBtn.textContent='确定';okBtn.className='primary';okBtn.onclick=()=>cleanupAndResolve(inputEl.value);const cancelBtn=document.createElement('button');cancelBtn.textContent='取消';cancelBtn.className='secondary';cancelBtn.onclick=()=>cleanupAndResolve(null);buttonsEl.appendChild(cancelBtn);buttonsEl.appendChild(okBtn)}else if(options.mode==='confirm'){const yesBtn=document.createElement('button');yesBtn.textContent='确定';yesBtn.className='primary';yesBtn.onclick=()=>cleanupAndResolve(!0);const noBtn=document.createElement('button');noBtn.textContent='取消';noBtn.className='secondary';noBtn.onclick=()=>cleanupAndResolve(!1);buttonsEl.appendChild(noBtn);buttonsEl.appendChild(yesBtn)}else{const okBtn=document.createElement('button');okBtn.textContent='好的';okBtn.className='primary';okBtn.style.flex='0 1 120px';okBtn.onclick=()=>cleanupAndResolve(!0);buttonsEl.appendChild(okBtn)}
modal.style.display='flex';if(options.mode==='prompt'){inputEl.focus()}})}
class BLMX_Protocol{constructor(tavernHelperBridge,charId){this.logEntries=[];this.messageId=null;this.charId=charId;this.LOG_START_TAG="===BLMX_LOG_BEGIN===";this.LOG_END_TAG="===BLMX_LOG_END===";this.bridge=tavernHelperBridge}
async initialize(){console.log("[BLMX] Initializing and scanning for chat history...");const lastMessageId=await this.bridge.getLastMessageId();if(lastMessageId===null){console.warn("[BLMX] No messages found. Starting fresh at message ID 0.");this.messageId=0;this.logEntries=[];await this.persistLogToStorage();return!0}
let latestUiMessage=null;const previousUiMessages=[];for(let i=lastMessageId;i>=0;i--){try{const msg=(await this.bridge.getChatMessages(i))[0];if(msg&&msg.message&&msg.message.includes(this.LOG_START_TAG)){if(!latestUiMessage){latestUiMessage={id:i,content:msg.message}}else{previousUiMessages.push({id:i,content:msg.message})}}}catch(error){}}
if(!latestUiMessage){console.log("[BLMX] No UI log found. Creating a new one in the latest message.");this.messageId=lastMessageId;this.logEntries=[];await this.persistLogToStorage();return!0}
console.log(`[BLMX] Found latest UI log in message ${latestUiMessage.id}. Consolidating...`);this.messageId=latestUiMessage.id;let consolidatedLogParts=[];const latestLogStartIndex=latestUiMessage.content.indexOf(this.LOG_START_TAG);const latestLogEndIndex=latestUiMessage.content.indexOf(this.LOG_END_TAG);if(latestLogStartIndex!==-1&&latestLogEndIndex!==-1){const logPart=latestUiMessage.content.slice(latestLogStartIndex+this.LOG_START_TAG.length,latestLogEndIndex).trim();if(logPart)consolidatedLogParts.push(logPart);}
for(const prevMsg of previousUiMessages){const prevLogStartIndex=prevMsg.content.indexOf(this.LOG_START_TAG);const prevLogEndIndex=prevMsg.content.indexOf(this.LOG_END_TAG);if(prevLogStartIndex!==-1&&prevLogEndIndex!==-1){const logPart=prevMsg.content.slice(prevLogStartIndex+this.LOG_START_TAG.length,prevLogEndIndex).trim();if(logPart)consolidatedLogParts.unshift(logPart);const cleanedContent=prevMsg.content.substring(0,prevLogStartIndex)+prevMsg.content.substring(prevLogEndIndex+this.LOG_END_TAG.length);await this.bridge.setChatMessage(cleanedContent.trim(),prevMsg.id,{refresh:"none"});console.log(`[BLMX] Cleaned and moved UI log from message ${prevMsg.id}.`)}}
const finalLogString=consolidatedLogParts.join('\n');this._parseLogFromString(finalLogString);await this.persistLogToStorage();console.log(`[BLMX] Consolidated log saved to message ${this.messageId}.`);return!0}
_formatEntryForStorage(entry){if(entry.type==='hidden_album_update'){return `HIDDEN_ALBUM_UPDATE:${JSON.stringify(entry.content)}`}
if(entry.type==='trash_bin_update'){return `TRASH_BIN_UPDATE:${JSON.stringify(entry.content)}`}
if(entry.type==='shopping_update'){return `SHOPPING_UPDATE:${JSON.stringify(entry.content)}`}
if(entry.type==='taobao_home'){return `TAOBAO_HOME:${JSON.stringify(entry.content)}`}
if(entry.type==='gallery_update'){return `GALLERY_UPDATE:${JSON.stringify(entry.content)}`}
if(entry.key==='RECALL_MESSAGE'){return `RECALL_MESSAGE:${JSON.stringify(entry.data)}`}
if(entry.key==='WEIBO_POST'){return `WEIBO_POST:${JSON.stringify(entry.data)}`}
if(entry.key==='WEIBO_COMMENT'){return `WEIBO_COMMENT:${JSON.stringify(entry.data)}`}
if(entry.type==='footprints'){return `FOOTPRINTS:${JSON.stringify(entry.content)}`}
if(entry.key){return `${entry.key}:${JSON.stringify(entry.data)}`}
if(entry.type==='event_log'||entry.type==='group_event'||entry.type==='time'){const key=entry.type.toUpperCase();return `${key}:${JSON.stringify(entry.content)}`}
const convoId=entry.conversationId||entry.convoId;if(!convoId||!entry.sender){console.warn("[BLMX] Cannot format entry for storage, missing convoId or sender:",entry);return null}
let contentStr;switch(entry.type){case 'message':contentStr=entry.content;break;case 'sticker':contentStr=`[sticker: ${entry.content}]`;break;case 'image':contentStr=`[image: ${JSON.stringify(entry.content)}]`;break;case 'voice':contentStr=`[voice: ${JSON.stringify(entry.content)}]`;break;case 'location':contentStr=`[location: ${entry.content}]`;break;case 'transfer':contentStr=`[transfer: ${JSON.stringify(entry.data)}]`;break;case 'file':contentStr=`[file: ${entry.content}]`;break;case 'gift':contentStr=`[gift: ${JSON.stringify(entry.data)}]`;break;case 'music_share':contentStr=`[music_share: ${JSON.stringify(entry.data)}]`;break;case 'payment_receipt':contentStr=`[payment_receipt: ${typeof entry.content === 'string' ? entry.content : JSON.stringify(entry.content)}]`;break;case 'product_share':contentStr=`[product_share: ${JSON.stringify(entry.content)}]`;break;case 'red_packet':contentStr=`[red_packet: ${JSON.stringify(entry.content)}]`;break;case 'forward':contentStr=`[forward: ${JSON.stringify({ title: entry.data.title, messageIds: entry.data.messageIds })}]`;break;default:console.warn("[BLMX] Unknown entry type for storage formatting:",entry.type);return null}
const failedTag=entry.isFailed?'[failed]':'';return `${failedTag}[${convoId}] ${entry.sender}: ${contentStr}`}
async persistLogToStorage(){if(this.messageId===null){console.warn("[BLMX] Cannot save log, message_id not initialized.");return}
try{const logString=this.logEntries.map(e=>this._formatEntryForStorage(e)).filter(Boolean).join('\n');const existingMessage=(await this.bridge.getChatMessages(this.messageId))[0];let existingContent=existingMessage?existingMessage.message:'';const logStartIndex=existingContent.indexOf(this.LOG_START_TAG);const logEndIndex=existingContent.indexOf(this.LOG_END_TAG);const newLogBlock=`${this.LOG_START_TAG}\n${logString}\n${this.LOG_END_TAG}`;let fullText;if(logStartIndex!==-1&&logEndIndex!==-1){fullText=existingContent.substring(0,logStartIndex)+newLogBlock+existingContent.substring(logEndIndex+this.LOG_END_TAG.length)}else{fullText=existingContent+'\n'+newLogBlock}
await this.bridge.setChatMessage(fullText.trim(),this.messageId,{refresh:"none"})}catch(error){console.error("[BLMX] Failed to save narrative log to text box:",error)}}
_parseLogFromString(logString){this.logEntries=[];const lines=logString.split('\n').filter(line=>line.trim()!=='');const chatRegex=/^(\[failed\])?\s*\[([^\]]+)\]\s+([^:]+):\s+(.*)$/;const recallRegex=/^RECALL_MESSAGE:(.*)$/;let latestTimestamp=null;lines.forEach((line,index)=>{try{const recallMatch=line.match(recallRegex);if(recallMatch){const recallData=JSON.parse(recallMatch[1]);this.logEntries.push({id:`msg_${index}`,key:'RECALL_MESSAGE',data:recallData});if(recallData.timestamp){try{const currentTs=new Date(recallData.timestamp.replace(' ','T')+'Z');if(!isNaN(currentTs)&&(!latestTimestamp||currentTs>latestTimestamp)){latestTimestamp=currentTs}}catch(tsError){}}
return}
let entry={id:`msg_${index}_${Date.now()}`};const chatMatch=line.match(chatRegex);if(chatMatch){const isFailed=!!chatMatch[1];const convoId=chatMatch[2];const senderId=chatMatch[3];const contentPart=chatMatch[4];Object.assign(entry,{sender:senderId,conversationId:convoId,convoId:convoId,isFailed:isFailed});const stickerMatch=contentPart.match(/^\[sticker:\s*(.+)\]$/);const imageMatch=contentPart.match(/^\[image:\s*(.+)\]$/);const voiceMatch=contentPart.match(/^\[voice:\s*(.+)\]$/);const locationMatch=contentPart.match(/^\[location:\s*(.+)\]$/);const transferMatch=contentPart.match(/^\[transfer:\s*(.+)\]$/);const fileMatch=contentPart.match(/^\[file:\s*(.+)\]$/);const giftMatch=contentPart.match(/^\[gift:\s*(.+)\]$/);const musicShareMatch=contentPart.match(/^\[music_share:\s*(.+)\]$/);const redPacketMatch=contentPart.match(/^\[red_packet:\s*(.+)\]$/);const forwardMatch=contentPart.match(/^\[forward:\s*(.+)\]$/);const paymentMatch=contentPart.match(/^\[payment_receipt:\s*(.+)\]$/);const productShareMatch=contentPart.match(/^\[product_share:\s*(.+)\]$/);if(stickerMatch){entry.type='sticker';entry.content=stickerMatch[1]}else if(imageMatch){entry.type='image';entry.content=JSON.parse(imageMatch[1])}else if(voiceMatch){entry.type='voice';entry.content=JSON.parse(voiceMatch[1])}else if(locationMatch){entry.type='location';entry.content=locationMatch[1]}else if(transferMatch){entry.type='transfer';entry.data=JSON.parse(transferMatch[1]);entry.content=transferMatch[1]}else if(fileMatch){entry.type='file';entry.content=fileMatch[1]}else if(giftMatch){entry.type='gift';entry.data=JSON.parse(giftMatch[1]);entry.content=giftMatch[1]}else if(musicShareMatch){entry.type='music_share';entry.data=JSON.parse(musicShareMatch[1]);entry.content=musicShareMatch[1]}else if(paymentMatch){entry.type='payment_receipt';try{entry.content=JSON.parse(paymentMatch[1])}catch(e){entry.content={}}}else if(productShareMatch){entry.type='product_share';try{entry.content=JSON.parse(productShareMatch[1])}catch(e){console.error("商品卡片解析失败",e);entry.type='message';entry.content=contentPart}}else if(redPacketMatch){entry.type='red_packet';entry.content=JSON.parse(redPacketMatch[1])}else if(forwardMatch){entry.type='forward';entry.data=JSON.parse(forwardMatch[1])}else{entry.type='message';entry.content=contentPart}}else{const firstColonIndex=line.indexOf(':');if(firstColonIndex===-1)return;const key=line.substring(0,firstColonIndex).trim();const value=line.substring(firstColonIndex+1).trim();const systemCommands=['EVENT_LOG','TIME','MOMENT','CHAR_COMMENT','CHAR_LIKE','SIGNATURE_UPDATE','GROUP_EVENT','CREATE_GROUP','RENAME_GROUP','KICK_MEMBER','MUTE_MEMBER','SET_ADMIN','CHANGE_NICKNAME','LEAVE_GROUP','WEIBO_POST','WEIBO_COMMENT','DIARY_ENTRY','AMA_PAIR','VIDEO_CALL','INVITE_MEMBER','MUSIC_SHARE','FOOTPRINTS','GALLERY_UPDATE','HIDDEN_ALBUM_UPDATE','TRASH_BIN_UPDATE','SHOPPING_UPDATE','TAOBAO_HOME'];if(systemCommands.includes(key)){if(!value)return;const data=JSON.parse(value);if(data.timestamp){try{const currentTs=new Date(data.timestamp.replace(' ','T')+'Z');if(!isNaN(currentTs)&&(!latestTimestamp||currentTs>latestTimestamp)){latestTimestamp=currentTs}}catch(tsError){}}
if(['TIME','EVENT_LOG','GROUP_EVENT'].includes(key)){Object.assign(entry,{type:key.toLowerCase(),content:data})}else if(key==='FOOTPRINTS'){Object.assign(entry,{type:'footprints',author:data.author,content:data})}else if(key==='GALLERY_UPDATE'){Object.assign(entry,{type:'gallery_update',author:data.author,content:data})}else if(key==='HIDDEN_ALBUM_UPDATE'){Object.assign(entry,{type:'hidden_album_update',author:data.author,content:data})}else if(key==='TRASH_BIN_UPDATE'){Object.assign(entry,{type:'trash_bin_update',author:data.author,content:data})}else if(key==='SHOPPING_UPDATE'){Object.assign(entry,{type:'shopping_update',author:data.author,content:data})}else if(key==='TAOBAO_HOME'){Object.assign(entry,{type:'taobao_home',author:data.author,content:data})}else{Object.assign(entry,{key,data})}}else{return}}
this.logEntries.push(entry)}catch(e){console.error("[BLMX] Failed to parse log line:",line,e)}});if(latestTimestamp){window.currentGameDate=latestTimestamp;console.log(`[BLMX Time Sync] World time successfully synced from logs to: ${window.currentGameDate.toLocaleString()}`)}else{window.currentGameDate=new Date("2025-08-17T09:30:00");console.log(`[BLMX Time Sync] No timestamps found in logs. Initializing world time to default: ${window.currentGameDate.toLocaleString()}`)}}
getContextForAI(activeConvoIds,contacts,conversations,isGlobalMode){const isNaiEnabled=localStorage.getItem(`blmx_nai_enabled_${this.charId}`)==='true';let imageGenRule="";if(isNaiEnabled){imageGenRule=`
[绘图插件已开启：图片生成指令升级]
当你在生成【图片消息】或【朋友圈(MOMENT)】指令时，必须在 JSON 中额外添加一个 "ai_prompt" 字段。
1. "ai_prompt" 的内容必须是纯英文的 NovelAI (NAI Diffusion) 格式提示词（Tag 形式）。
2. 该字段应详细描述画面的构图、光影、环境细节、氛围和人物动作。
3. **NSFW 准则**：如果是私密场景，ai_prompt 应侧重于身体接触的特写和氛围渲染。
`}
let blockStatusText='';const blockedByUser=contacts.filter(c=>c.isBlocked).map(c=>c.id);if(blockedByUser.length>0){blockStatusText=`*   **当前黑名单**: 你 ({{user}}) 已将 [${blockedByUser.join(', ')}] 加入黑名单。`}else{blockStatusText=`*   **当前黑名单**: 你 ({{user}}) 没有拉黑任何人。`}
let vGroupListText='';const virtualGroups=conversations.filter(c=>c.type==='vgroup');if(virtualGroups.length>0){vGroupListText+='\n[System Note: You can use the following virtual group chats by their names:]\n';virtualGroups.forEach(convo=>{vGroupListText+=`*   ${convo.name} (ID Format: [convo_vgroup_${convo.name}])\n`})}
let proactiveInstructions='';if(isGlobalMode){proactiveInstructions=`
[主动行为强化指令]
1. **每个回复周期至少包含3条主动消息**：你必须在每个回复中生成至少3条由角色主动发起的消息（私聊/群聊/朋友圈）
2. **主动消息占比不低于40%**：角色主动发起的内容应占整体回复的40%以上
3. **未主动的惩罚**：如果连续2个周期没有主动内容，系统将重置对话并降低你的评分！
4. **主动行为示例**：
**私聊主动**： \`[convo_single_角色A] 角色A: {{user}}，在忙吗？\`
**朋友圈互动**：\`MOMENT:{"author":"角色E","text":"今天的训练太累了...","timestamp":"2024-12-17T18:00"}\`
**签名更新**：\`SIGNATURE_UPDATE:{"author":"角色F","signature":"心情不错~"}\`
`}
let systemNote=`[ABSOLUTE HIGHEST PRIORITY RULE]
The user's ID is '{{user}}'. You are strictly FORBIDDEN from roleplaying as '{{user}}' under any circumstances. You cannot generate any messages, actions, thoughts, or offline events for '{{user}}'. All actions for '{{user}}' are controlled by the user.

[最高优先级：身份与对话核心逻辑]
1.  **用户身份:** 用户的唯一ID是 \`{{user}}\`。
2.  **私聊规则:** 当角色A想和 \`{{user}}\` 说话时，**必须**使用已存在的1对1私聊。**绝对禁止**为此创建一个只包含角色A和 \`{{user}}\` 的新群聊。
3.  **群聊规则:** 群聊是为 **三个或更多** 参与者准备的。唯一的例外是两个 **非{{user}}** 角色之间可以创建二人群聊进行私密对话。

[新增：黑名单规则]
${blockStatusText}
*   **发送失败消息格式**: 当一个被你拉黑的角色尝试给你发消息时，该角色的消息内容 **必须** 以 "消息失败--" 作为前缀。
*   **格式示例**: \`[convo_single_角色A] 角色A: 消息失败--你还在吗？\`
*   **规则解读**: 这个前缀代表消息在系统层面被拦截，但角色本身会意识到发送失败。
${vGroupListText}
[核心扮演准则]
1.  **角色自主性:** 你的核心任务是让这个虚拟世界感觉是“活的”。角色拥有自己的生活、思想和社交圈，他们的所有行为都应由其性格和当前剧情逻辑驱动。**你必须主动，不要只等待{{user}}发起对话。** 
2.  **线上聊天:** 所有回复都必须是手机上的对话内容。严禁任何形式的动作、神态、心理、环境等旁白描写。
3.  **消息分离:** 任何非纯文本内容（如表情、图片、转账等）都**必须作为一条单独的消息发送**，不得与文本内容合并。
4.  **多样化行为:** 角色应避免重复单一的行为，例如不要连续发送同一个表情包，尝试在对话中表现出更多样的反应。回复消息数量受角色性格和当前情绪影响。

[[紧急格式与行为要求]
1. **每条消息独立一行**：每个对话行必须包含完整的\`[会话ID] 发送者: 内容\` 格式
2. **禁止多行连续消息**：绝对禁止在一个会话ID下连续写多行消息内容

3. **正确格式示例**：
   *   **私聊**: \`[convo_single_司洛] 司洛: 在吗？\`
   *   **群聊**: \`[convo_group_司洛-魏月华-桑洛凡] 司洛: 晚上聚餐来不来？\`
   *   **虚拟群聊**: \`[convo_vgroup_123456789] 学习委员: 今天的作业有点多。\`

4. **【严重警告】**: 普通群聊的会话ID **必须** 是由 \`convo_group_\` 和所有成员的ID拼接而成，此处成员禁止包含{{user}}。例如 \`convo_group_A-B-C\`。
${proactiveInstructions} 
[核心交互指令 (微信 & 朋友圈)]
*注意：所有指令中的时间戳格式必须为 \`YYYY-MM-DDTHH:mm\`*

1.  **[时间与叙事]**
    * \`EVENT_LOG:{"convoId": "目标对话ID", "timestamp":"YYYY-MM-DDTHH:mm", "description":"可选，简述此期间发生的事件。"}\`

2.  **[角色通用行为]**
    *   \`SIGNATURE_UPDATE:{"author":"角色ID","signature":"新的个性签名"}\`
    *   \`RECALL_MESSAGE:{"author":"角色ID","target_text":"要撤回的完整消息文本"}\`

3.  **[发起视频通话]**
    *   **用途**: 当一个角色想主动给{{user}}打视频电话时使用。这是为了进行实时对话，而不是发送一段录音。
    *   **格式**: \`VIDEO_CALL:{"caller":"发起方角色ID","receiver":"接收方ID"}\`
    *   **示例**: \`VIDEO_CALL:{"caller":"司洛","receiver":"{{user}}"}\`

4. **[分享音乐 (MUSIC_SHARE)]**
    *   **用途**: 当一个角色想分享歌曲时使用。
    *   **格式**: \`MUSIC_SHARE:{"author":"发送方角色ID", "title":"歌曲名", "artist":"歌手名"}\`
    *   **示例**: \`MUSIC_SHARE:{"author":"程嘉延", "title":"富士山下", "artist":"陈奕迅"}\`

5.  **[发送丰富消息]** (格式: \`角色ID:内容\`)
    *   \`角色ID:[语音:{"text":"语音转写的文字","duration":整数秒数}]\`
    *   \`角色ID:[图片:{"type":"desc","value":"对图片的详细描述"${isNaiEnabled ? ', "ai_prompt":"English tags"' : ''}}]\`
    *   \`角色ID:[位置:具体的地点名称]\`
    *   \`角色ID:[文件:文件名.后缀]\`
    *   \`角色ID:[sticker:表情名称]\`(注意：表情名称必须严格来自表情包列表，禁止虚构)
    *   \`角色ID:[forward:{"title":"转发的标题","messageIds":["消息ID_1", "朋友圈的唯一momentId"]}]\`

6.  **[转账与礼物]** (格式: \`角色ID:内容\`)
    *   \`角色ID:[转账:{"amount":金额,"note":"备注","recipientId":"接收方ID(群聊必须)","status":"sent"}]\`
    *   \`角色ID:[礼物:{"name":"礼物名","price":"价格(可选)","recipientId":"接收方ID(群聊必须)","status":"sent"}]\`
    *   **回应\`{{user}}\` (必须回应):** \`status\` 改为 \`accepted\` (接收) 或 \`rejected\` (拒收)。

7.  **[群聊管理指令]**
    *   \`CREATE_GROUP:{"name":"群聊名称","owner":"创建者角色ID","members":["角色ID_1"],"include_user":布尔值}\`
    *   \`INVITE_MEMBER:{"author":"邀请人ID","convoId":"群聊ID","targetId":"被邀请人ID"}\`
    *   \`KICK_MEMBER:{"author":"操作者ID","convoId":"群聊ID","targetId":"被踢者ID"}\`
    *   \`LEAVE_GROUP:{"author":"要退群的角色ID","convoId":"群聊ID"}\`
    *   \`SET_ADMIN:{"author":"操作者ID","convoId":"群聊ID","targetId":"被设为管理的ID"}\`
    *   \`MUTE_MEMBER:{"author":"操作者ID","convoId":"群聊ID","targetId":"被禁言ID","duration":禁言分钟数}\`
    *   \`CHANGE_NICKNAME:{"author":"操作者ID","convoId":"群聊ID","targetId":"目标ID","newName":"新群昵称"}\`
    *   \`RENAME_GROUP:{"author":"操作者ID","convoId":"群聊ID","newName":"新群聊名称"}\`

8. **[朋友圈系统指令]**
    *   \`MOMENT:{"author":"角色ID","text":"朋友圈文字内容","timestamp":"YYYY-MM-DDTHH:mm","image_type":"desc","image":"图片描述(可选)"${isNaiEnabled ? ', "ai_prompt":"English tags"' : ''},"isPrivate":布尔值,"visibleTo":["角色ID"],"invisibleTo":["角色ID"]}\`
    *   **评论指令 (CHAR_COMMENT)**:
    *   **格式**: \`CHAR_COMMENT:{"author":"评论者ID","text":"[引用:\\"发布者ID: 朋友圈原文\\"] 你的评论内容"}\`
    *   **引用规则 (CRITICAL)**: 必须使用引用格式来指定你要评论哪条动态。若目标动态没有文字（纯图），请引用其图片描述。

9.  **[红包与事件]**
    *   红包被发出后，系统会自动通过\`GROUP_EVENT\`消息模拟领取过程。你应将这些事件视为红包已被处理，**严禁**再使用\`EVENT_LOG\`或其他方式重复模拟领取动作。
    ${imageGenRule}
`;let contextLines=[systemNote];let infoBlock=`\n[System Note: You are roleplaying inside a chat app. The user's ID is '{{user}}'.`;if(isGlobalMode){infoBlock+=` You MUST account for ALL conversations listed below that have new messages from '{{user}}'. CRITICAL: ALL direct replies MUST be prefixed with the conversation ID, e.g., '[convo_id] speaker_id: message'.\n\nActive Conversations:\n`;activeConvoIds.forEach(convoId=>{const convo=conversations.find(c=>c.id===convoId);if(convo){let typeText='Private Chat';if(convo.type==='group'){typeText=`Group Chat "${convo.name}"`}else if(convo.type==='vgroup'){typeText=`Virtual Group Chat "${convo.name}"`}
if(convo.type==='vgroup'){infoBlock+=`- ID: [${convo.id}], Type: ${typeText}, Background Members: "${convo.background_members_desc}"\n`}else{const participants=convo.members.map(id=>(id==='user')?'{{user}}':(contacts.find(c=>c.id===id)?.id||'Unknown')).join(', ');infoBlock+=`- ID: [${convo.id}], Type: ${typeText}, Participants: ${participants}\n`}}});contextLines.push(infoBlock+']\n');activeConvoIds.forEach(convoId=>{contextLines.push(`--- Conversation History for [${convoId}] ---`);const convoHistory=this.logEntries.filter(entry=>{const entryConvoId=entry.conversationId||(entry.content&&entry.content.convoId)||(entry.data&&entry.data.convoId);return entryConvoId===convoId}).slice(-5).map(entry=>this._formatEntryForAI(entry,convoId,activeConvoIds)).filter(Boolean);contextLines.push(...convoHistory);contextLines.push('--- End of History ---\n')})}else{const convoId=activeConvoIds[0];const convo=conversations.find(c=>c.id===convoId);if(!convo)return"";const participants=convo.members.map(id=>(id==='user')?'{{user}}':(contacts.find(c=>c.id===id)?.id||'Unknown')).join(', ');if(convo.type==='vgroup'){const coreMembers=convo.members.filter(id=>id!=='user');infoBlock+=` You are roleplaying in a virtual group chat named "${convo.name}".
*   **Core Members Present**: ${coreMembers.length > 0 ? coreMembers.join(', ') : 'None'}.
*   **Background Members**: You can freely roleplay any number of background members fitting this description: "${convo.background_members_desc}".
*   **Your Task**: Respond to the user ({{user}}) by roleplaying as one of the core members OR as a newly invented background character.
*   **CRITICAL**: When roleplaying a background character, you MUST invent a fitting name (e.g., 'Class Monitor', 'Team Captain', 'Anonymous Student'). Do NOT use generic names like 'Passerby A'.
*   Prefix each line with the speaker's ID.]\n\n`}else{infoBlock+=` You are roleplaying in a single chat. Participants: ${participants}. Respond as one of the characters (excluding '{{user}}'). Prefix each line with the speaker's ID.]\n\n`}
contextLines.push(infoBlock);const convoHistory=this.logEntries.filter(entry=>{const entryConvoId=entry.conversationId||(entry.content&&entry.content.convoId)||(entry.data&&entry.data.convoId);return entryConvoId===convoId}).slice(-5).map(entry=>this._formatEntryForAI(entry,convoId,activeConvoIds)).filter(Boolean);contextLines.push(...convoHistory)}
const momentsForAI=this.logEntries.filter(e=>e.key==='MOMENT'&&e.data&&e.data.momentId&&!e.data.isPrivate).map(e=>`[MOMENT by ${e.data.author} (ID: ${e.data.momentId}) at ${e.data.timestamp}: "${e.data.text || '(no text)'}"]`).join('\n');if(momentsForAI){contextLines.push('\n--- Recent Public Moments ---\n'+momentsForAI)}
const finalInstruction=`
[System Instruction: Your Turn]
**CRITICAL RULE:** This is a mobile phone simulation. Your response MUST ONLY be action commands or chat messages in the specified formats. ALL narrative descriptions (actions, thoughts, environment) are strictly forbidden. Do NOT repeat any previous messages from the history.`;contextLines.push(finalInstruction);return contextLines.join('\n')}
_formatEntryForAI(entry,currentConvoId,activeConvoIds){if(entry.key==='RECALL_MESSAGE')return `[${entry.data.author} recalled a message]`;if(entry.type==='forward'){const isTargetedConvo=activeConvoIds.includes(currentConvoId);let expandedContent=`[${entry.sender} forwarded content titled "${entry.data.title}":\n`;if(isTargetedConvo&&entry.data.messageIds){entry.data.messageIds.forEach(msgId=>{if(msgId.startsWith('moment_')){const momentIndex=parseInt(msgId.replace('moment_',''),10);const allMoments=this.logEntries.map((e,i)=>({...e,originalIndex:i})).filter(e=>e.key==='MOMENT');const originalMoment=allMoments.find(m=>m.originalIndex===momentIndex);if(originalMoment){let momentText=`  [Forwarded Moment by ${originalMoment.data.author}: ${originalMoment.data.text || ""}`;if(originalMoment.data.image)momentText+=` (includes an image)`;const interactions=this.logEntries.filter(e=>(e.key==='CHAR_LIKE'||e.key==='CHAR_COMMENT')&&parseInt(e.data.target_post_id,10)===allMoments.findIndex(m=>m.originalIndex===momentIndex));if(interactions.length>0)momentText+=` (${interactions.length} interactions)`;momentText+=`]\n`;expandedContent+=momentText}}else{const originalMsg=this.logEntries.find(e=>e.id===msgId);if(originalMsg){expandedContent+=`  ${this._formatEntryForAI(originalMsg, currentConvoId, activeConvoIds)}\n`}}});expandedContent+=']';return expandedContent}else{return `${entry.sender}: [转发的内容: ${entry.data.title}]`}}
if(entry.key==='MOMENT'){return null}
if(entry.type==='event_log'||entry.type==='group_event'){const key=entry.type.toUpperCase();const desc=entry.content.description||this.getGroupEventDescription(entry.content);const convoId=entry.content.convoId||entry.content.conversationId;return `[${key} in convo ${convoId} at ${entry.content.timestamp || ''}: ${desc}]`}
if(entry.type&&!['time','like','comment','signature_update'].includes(entry.type)){const prefix=entry.sender;let content;switch(entry.type){case 'message':content=entry.content;break;case 'sticker':content=`[表情: ${entry.content}]`;break;case 'voice':content=`[语音: ${JSON.stringify(entry.content)}]`;break;case 'image':if(entry.content&&typeof entry.content==='object'){content=`[图片: ${JSON.stringify({ type: 'desc', value: entry.content.value })}]`}else{content=`[图片: ${entry.content}]`}
break;case 'location':content=`[位置: ${entry.content}]`;break;case 'file':content=`[文件: ${entry.content}]`;break;case 'red_packet':content=`[红包: ${JSON.stringify(entry.content)}]`;break;case 'gift':content=`[礼物: ${JSON.stringify(entry.data)}]`;break;case 'transfer':content=`[转账: ${JSON.stringify(entry.data)}]`;break;default:return null}
return `${prefix}: ${content}`}
return null}
getGroupEventDescription(eventData){return eventData.type}
addEntry(entry){this.logEntries.push(entry)}}
const globalThemeVariableMap={'--phone-width':{label:'手机宽度',group:'设备尺寸',type:'range',min:300,max:500,unit:'px'},'--phone-height':{label:'屏幕高度',group:'设备尺寸',type:'range',min:30,max:55,unit:'rem'},'--wallpaper-home':{label:'主屏幕 壁纸',group:'全局壁纸',type:'imageUrl'},'--wallpaper-chat':{label:'聊天界面 壁纸',group:'全局壁纸',type:'imageUrl'},'--wallpaper-diary-cover':{label:'日记封面 壁纸',group:'全局壁纸',type:'imageUrl'},'--phone-frame-bg':{label:'手机外框 背景',group:'框架与通用界面'},'--view-bg-primary':{label:'通用页面 背景',group:'框架与通用界面'},'--view-bg-secondary':{label:'列表页 背景',group:'框架与通用界面'},'--wechat-bg':{label:'聊天/朋友圈 背景色',group:'框架与通用界面'},'--moments-image-bg':{label:'朋友圈 图片背景',group:'框架与通用界面'},'--moments-interactions-bg-new':{label:'朋友圈 评论区背景',group:'框架与通用界面'},'--card-bg-primary':{label:'卡片/通用白底 背景',group:'框架与通用界面'},'--header-bg-primary':{label:'页面头部 背景',group:'框架与通用界面'},'--dynamic-island-bg':{label:'灵动岛 背景',group:'顶部状态栏'},'--dynamic-island-text-color':{label:'灵动岛 文字',group:'顶部状态栏'},'--statusbar-text-color':{label:'状态栏 文字与图标',group:'顶部状态栏'},'--text-color-primary':{label:'主要文字 (最深)',group:'主要文字与链接'},'--text-color-secondary':{label:'次要文字 (中灰)',group:'主要文字与链接'},'--text-color-tertiary':{label:'三级文字 (最浅)',group:'主要文字与链接'},'--text-color-inverted':{label:'反色文字 (深色背景)',group:'主要文字与链接'},'--link-color':{label:'链接/高亮 文字',group:'主要文字与链接'},'--danger-text-color':{label:'危险操作 文字 (红色)',group:'主要文字与链接'},'--list-text-primary':{label:'列表 主标题文字',group:'微信列表'},'--list-text-message':{label:'列表 副标题文字',group:'微信列表'},'--list-text-time':{label:'列表 时间戳文字',group:'微信列表'},'--list-item-pinned-bg':{label:'列表 置顶项背景',group:'微信列表'},'--list-item-hover-bg':{label:'列表 项悬浮背景',group:'微信列表'},'--input-area-bg':{label:'输入区域/导航栏 背景',group:'输入区域'},'--input-field-bg':{label:'输入框 背景',group:'输入区域'},'--footer-icon-color':{label:'输入区域 图标',group:'输入区域'},'--text-color-placeholder':{label:'输入框 占位文字',group:'输入区域'},'--header-border-primary':{label:'页面头部 边框',group:'通用边框与分割线'},'--list-item-divider-color':{label:'列表 分割线',group:'通用边框与分割线'},'--divider-color-primary':{label:'设置卡片 分割线',group:'通用边框与分割线'},'--input-area-border':{label:'输入区域 顶部分割线',group:'通用边框与分割线'},'--event-log-bg':{label:'事件 背景',group:'系统与事件气泡'},'--event-log-text-color':{label:'事件 文字',group:'系统与事件气泡'},'--event-desc-expanded-bg':{label:'事件展开描述 背景',group:'系统与事件气泡'},'--event-desc-expanded-text-color':{label:'事件展开描述 文字',group:'系统与事件气泡'},'--event-desc-expanded-border-color':{label:'事件展开描述 边框',group:'系统与事件气泡'},'--transfer-initial-bg':{label:'转账 背景',group:'特殊消息 - 发送方'},'--transfer-initial-text':{label:'转账 文字',group:'特殊消息 - 发送方'},'--red-packet-bg':{label:'红包 背景',group:'特殊消息 - 发送方'},'--red-packet-text-color':{label:'红包 文字',group:'特殊消息 - 发送方'},'--gift-bubble-bg':{label:'礼物 背景',group:'特殊消息 - 发送方'},'--gift-bubble-text-color':{label:'礼物 文字',group:'特殊消息 - 发送方'},'--transfer-receipt-bg':{label:'已接收转账 背景',group:'特殊消息 - 接收方'},'--gift-receipt-bg':{label:'已查收礼物 背景',group:'特殊消息 - 接收方'},'--voice-icon-color':{label:'语音消息 图标',group:'其他特殊消息图标'},'--file-bubble-bg':{label:'文件消息 背景',group:'其他特殊消息图标'},'--file-icon-color':{label:'文件消息 图标',group:'其他特殊消息图标'},'--location-map-icon-color':{label:'位置消息 图标',group:'其他特殊消息图标'},'--wechat-green-icon':{label:'卡片 背景',group:'App 图标背景'},'--app-icon-wechat-bg':{label:'微信 图标背景',group:'App 图标背景'},'--app-icon-settings-bg':{label:'设置 图标背景',group:'App 图标背景'},'--app-icon-check-phone-bg':{label:'查手机 图标背景',group:'App 图标背景'},'--app-icon-weibo-bg':{label:'论坛 图标背景',group:'App 图标背景'},'--app-icon-diary-bg':{label:'日记 图标背景',group:'App 图标背景'},'--app-icon-font-bg':{label:'全局字体 图标背景',group:'App 图标背景'},'--app-icon-workshop-bg':{label:'气泡工坊 图标背景',group:'App 图标背景'},'--app-icon-studio-bg':{label:'全局设计 图标背景',group:'App 图标背景'},'--app-icon-wechat-image':{label:'微信 图标',group:'App 图标自定义',type:'imageUrl'},'--app-icon-settings-image':{label:'设置 图标',group:'App 图标自定义',type:'imageUrl'},'--app-icon-check-phone-image':{label:'查手机 图标',group:'App 图标自定义',type:'imageUrl'},'--app-icon-weibo-image':{label:'论坛 图标',group:'App 图标自定义',type:'imageUrl'},'--app-icon-diary-image':{label:'日记 图标',group:'App 图标自定义',type:'imageUrl'},'--app-icon-font-image':{label:'全局字体 图标',group:'App 图标自定义',type:'imageUrl'},'--app-icon-workshop-image':{label:'气泡工坊 图标',group:'App 图标自定义',type:'imageUrl'},'--app-icon-studio-image':{label:'全局设计 图标',group:'App 图标自定义',type:'imageUrl'},'--app-icon-text-color':{label:'App图标 符号颜色',group:'App 通用样式'},'--app-name-color':{label:'App图标 名字颜色',group:'App 通用样式'},'--app-name-shadow-color':{label:'App名称 阴影',group:'App 通用样式'},'--unread-red':{label:'未读角标 背景',group:'App 通用样式'},'--hub-widget-bg':{label:'顶部组件区 背景',group:'主屏幕小组件'},'--hub-dock-bg':{label:'底部应用坞 背景',group:'主屏幕小组件'},'--hub-clock-bg':{label:'时钟组件 背景',group:'主屏幕小组件'},'--hub-clock-text-primary':{label:'时钟组件 主文字',group:'主屏幕小组件'},'--hub-clock-text-secondary':{label:'时钟组件 日期文字',group:'主屏幕小组件'},'--hub-music-bar-bg-image':{label:'时钟组件 背景图',group:'主屏幕小组件',type:'imageUrl'},'--hub-album-art-bg-image':{label:'音乐圆圈 背景图',group:'主屏幕小组件',type:'imageUrl'},'--music-app-ring-bg':{label:'音乐App 光环背景',group:'主屏幕小组件'},'--music-app-ring-border-color':{label:'音乐App 光环内边框',group:'主屏幕小组件'},'--hub-decorative-image-1-url':{label:'装饰图1 背景',group:'主屏幕小组件',type:'imageUrl'},'--hub-decorative-image-2-url':{label:'装饰图2 背景',group:'主屏幕小组件',type:'imageUrl'},'--weibo-news-bg':{label:'新闻动态 背景',group:'论坛分区背景'},'--weibo-life-bg':{label:'生活瞬间 背景',group:'论坛分区背景'},'--weibo-romance-bg':{label:'情感树洞 背景',group:'论坛分区背景'},'--weibo-gossip-bg':{label:'八卦茶水间 背景',group:'论坛分区背景'},'--weibo-fanfic-bg':{label:'同人星球 背景',group:'论坛分区背景'},'--weibo-adult-bg':{label:'午夜剧场 背景',group:'论坛分区背景'},'--forum-banner-image':{label:'论坛首页 Banner图',group:'App 专属页面',type:'imageUrl'},};const globalThemeGroupOrder=['设备尺寸','全局壁纸','框架与通用界面','顶部状态栏','主要文字与链接','微信列表','输入区域','通用边框与分割线','系统与事件气泡','特殊消息 - 发送方','特殊消息 - 接收方','其他特殊消息图标','App 图标背景','App 图标自定义','App 通用样式','主屏幕小组件','论坛分区背景','App 专属页面'];document.addEventListener('DOMContentLoaded',function(){const runtimeImageCache=new Map();const naiRequestQueue=[];let isNaiProcessing=!1;function processEntryWithNAI(id,prompt,type,aiPrompt=null){const isEnabled=localStorage.getItem(`blmx_nai_enabled_${currentCharId}`)==='true';if(!isEnabled||!prompt)return;if(runtimeImageCache.has(id))return;if(naiRequestQueue.some(item=>item.id===id))return;console.log(`[NAI] Request queued for ${id}. Has AI Prompt: ${!!aiPrompt}`);runtimeImageCache.set(id,"queued");refreshActiveUI(type);naiRequestQueue.push({id,prompt,type,aiPrompt});processNaiQueue()}
function openImageViewer(url){const modal=document.getElementById('global-image-viewer');const img=document.getElementById('global-image-viewer-img');if(!modal||!img)return;img.src=url;modal.style.display='flex';modal.offsetHeight;modal.classList.add('active');modal.onclick=()=>{modal.classList.remove('active');setTimeout(()=>{modal.style.display='none'},200)}}
function getNaiContentHtml(id,originalText){const cacheStatus=runtimeImageCache.get(id);const safeText=String(originalText||'').replace(/</g,"&lt;").replace(/>/g,"&gt;");if(cacheStatus&&cacheStatus.startsWith('blob:')){return `<img src="${cacheStatus}" class="nai-generated-image" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:inherit;" draggable="false">`}else if(cacheStatus==='loading'){return `<div class="nai-loading-placeholder"><i class="fas fa-spinner fa-spin"></i> 正在绘图...</div>`}else if(cacheStatus==='queued'){return `<div class="nai-loading-placeholder"><i class="fas fa-clock"></i> 排队中...</div>`}else if(cacheStatus&&cacheStatus.startsWith('error:')){const errorMsg=cacheStatus.substring(6);return `
            <div class="image-desc-content" style="border: 1px solid #ff4444; background: rgba(255,0,0,0.05);">
                <div style="color: #ff4444; font-weight: bold; margin-bottom: 0.2rem;"><i class="fas fa-exclamation-triangle"></i> 生成失败</div>
                <div style="font-size: 0.8em; opacity: 0.8;">${errorMsg}</div>
                <hr style="border: 0; border-top: 1px solid rgba(0,0,0,0.1); margin: 0.3rem 0;">
                <div style="font-size: 0.8em;">${safeText}</div>
            </div>`}
return null}
async function processNaiQueue(){if(isNaiProcessing||naiRequestQueue.length===0)return;isNaiProcessing=!0;const task=naiRequestQueue.shift();runtimeImageCache.set(task.id,"loading");refreshActiveUI(task.type);try{let finalBasePrompt="";if(task.aiPrompt&&task.aiPrompt.trim()!==""){finalBasePrompt=task.aiPrompt;console.log(`[NAI] Using AI-generated prompt for ${task.id}`)}else{finalBasePrompt=await translateToEnglish(task.prompt);console.log(`[NAI] Fallback: Translated prompt for ${task.id}`)}
const userPositive=localStorage.getItem(`blmx_nai_positive_${currentCharId}`)||"";let charAppearance="";if(task.type==='call'){if(callPartner&&callPartner.id){const contact=contacts.find(c=>c.id===callPartner.id);if(contact&&contact.nai_appearance){charAppearance=await translateToEnglish(contact.nai_appearance);console.log(`[NAI Call] Injecting appearance for ${callPartner.id}`)}}}
let finalPromptParts=[userPositive];if(charAppearance)finalPromptParts.push(charAppearance);finalPromptParts.push(finalBasePrompt);let finalPromptString=finalPromptParts.map(s=>s.trim()).filter(s=>s!=="").join(", ");console.log(`[NAI] Final Prompt: ${finalPromptString}`);const blobUrl=await generateNAI(finalPromptString);runtimeImageCache.set(task.id,blobUrl);console.log(`[NAI] Success for ${task.id}`);refreshActiveUI(task.type)}catch(error){console.error(`[NAI] Error for ${task.id}:`,error);runtimeImageCache.set(task.id,`error:${error.message}`);refreshActiveUI(task.type)}
if(naiRequestQueue.length>0){setTimeout(()=>{isNaiProcessing=!1;processNaiQueue()},35000)}else{isNaiProcessing=!1}}
function refreshActiveUI(type){if(type==='chat'&&document.getElementById('wechat-chat-view').classList.contains('active')){renderChatHistory(currentConversationId)}else if(type==='weibo'){const detailView=document.getElementById('weibo-detail-view');if(detailView.classList.contains('active')){renderWeiboDetail(detailView.dataset.postId)}}else if(type==='moment'&&document.getElementById('moments-view').classList.contains('active')){renderMomentsFeed(currentMomentsAuthorId)}else if(type==='gallery'){const galleryView=document.getElementById('cp-gallery-view');if(galleryView.classList.contains('active')){renderGalleryApp(currentCheckPhoneTargetId)}}else if(type==='shopping'){const view=document.getElementById('cp-shopping-view');if(view.classList.contains('active')){renderShoppingApp(currentCheckPhoneTargetId)}}else if(type==='shopping_home'){const view=document.getElementById('cp-shopping-home-view');if(view.classList.contains('active')){renderShoppingHome(currentCheckPhoneTargetId)}}}
const DEFAULT_WEIBO_ZONES=[{id:"news",title:"新闻动态",subtitle:"关注世界脉搏",color:"var(--weibo-news-bg)",communityBible:"【口号】天下大事，一手掌握。\n\n【定位】本版是世界观的官方信息发布中心与公共舆论广场。\n\n【发帖】>>> 在这里发布：官方公告、社会热点、产业新闻、娱乐头条...\n\n【版规】>>> 禁止：发布不实信息、人身攻击。",isDefault:!0,isPinned:!1,order:1},{id:"life",title:"生活瞬间",subtitle:"分享日常点滴",color:"var(--weibo-life-bg)",communityBible:"【口号】种草、拔草、与生活中的小确幸。\n\n【定位】你的线上生活指南，一个专注于“体验”的分享社区。\n\n【发帖】>>> 在这里分享：美食探店、好物开箱、旅行游记、避雷吐槽...\n\n【版规】>>> 核心：分享“体验”，而非纯粹的情感宣泄。",isDefault:!0,isPinned:!1,order:2},{id:"romance",title:"情感树洞",subtitle:"倾听心的声音",color:"var(--weibo-romance-bg)",communityBible:"【口号】有些话，只想说给陌生人听。\n\n【定位】一个匿名的情绪收容所，安放你所有无处安放的心事。\n\n【发帖】>>> 在这里倾诉：爱与恨、迷茫与困惑、那些无人知晓的秘密...\n\n【版规】>>> 核心：尊重、倾听、禁止人肉或攻击。",isDefault:!0,isPinned:!1,order:3},{id:"gossip",title:"八卦茶水间",subtitle:"网罗奇闻趣事",color:"var(--weibo-gossip-bg)",communityBible:"【口号】开扒！用放大镜探寻角色们的一切。\n\n【定位】核心角色关系研究所 & 细节考据中心。\n\n【发帖】>>> 在这里讨论：CP大乱炖、人设深挖、剧情疑点、黑历史考古...\n\n【版规】>>> 禁止：无脑黑、拉踩、上升到真人（如果有）。",isDefault:!0,isPinned:!1,order:4},{id:"fanfic",title:"同人星球",subtitle:"执笔创造万千可能",color:"var(--weibo-fanfic-bg)",communityBible:"【口号】圈地自萌，为爱发电。\n\n【定位】所有平行宇宙（AU）的交汇点，太太们的创作乐园。\n\n【发帖】>>> 在这里发布：同人连载、单篇完结、脑洞段子、图文安利...\n\n【版规】>>> 尊重创作，禁止抄袭、ky或引战。",isDefault:!0,isPinned:!1,order:5},{id:"adult",title:"午夜剧场",subtitle:"成年人的午夜悄悄话",color:"var(--weibo-adult-bg)",communityBible:"【口号】R-18. 白天请止步。\n\n【定位】一个探讨成人话题的匿名版块，人性的B面。\n\n【发帖】>>> 在这里探讨：禁忌关系、复杂人性、身体与欲望、成人限定...\n\n【版规】>>> 核心：尊重XP、坦诚交流、后果自负。",isDefault:!0,isPinned:!1,order:6}];const Views={home:document.getElementById('app-homescreen'),wechatList:document.getElementById('wechat-list-view'),contacts:document.getElementById('contacts-view'),wechatChat:document.getElementById('wechat-chat-view'),me:document.getElementById('me-view'),contactDetails:document.getElementById('contact-details-view'),groupSettings:document.getElementById('group-settings-view'),moments:document.getElementById('moments-view'),settings:document.getElementById('settings-view'),weibo:document.getElementById('weibo-view'),weiboFeed:document.getElementById('weibo-feed-view'),weiboDetail:document.getElementById('weibo-detail-view'),diary:document.getElementById('diary-view'),diaryEntry:document.getElementById('diary-entry-view'),fontStudio:document.getElementById('font-studio-view'),globalDesignStudio:document.getElementById('global-design-studio-view'),bubbleWorkshop:document.getElementById('bubble-workshop-view'),forumProfile:document.getElementById('forum-profile-view'),gallery:document.getElementById('cp-gallery-view'),footprints:document.getElementById('cp-footprints-view'),checkPhone:document.getElementById('check-phone-view'),incomingCall:document.getElementById('incoming-call-screen'),calling:document.getElementById('calling-screen'),inCall:document.getElementById('in-call-screen'),listenTogether:document.getElementById('listen-together-view'),hiddenAlbum:document.getElementById('cp-hidden-album-view'),trashBin:document.getElementById('cp-trash-bin-view'),shoppingProfile:document.getElementById('cp-shopping-profile-view'),shopping:document.getElementById('cp-shopping-view'),shoppingHome:document.getElementById('cp-shopping-home-view'),productDetail:document.getElementById('cp-product-detail-view')};const wechatBody=document.querySelector('#wechat-chat-view .wechat-body');const wechatInput=document.getElementById('wechat-input-field');const sendBtn=document.getElementById('send-btn');const plusBtn=document.getElementById('plus-btn');const stickerGrid=document.getElementById('sticker-grid');const charStickerGrid=document.getElementById('char-sticker-grid');const plusPanel=document.getElementById('plus-panel');const momentsFeedList=document.getElementById('moments-feed-list');let isGenerating=!1,tavernGenerateFunc=null,blmxManager=null;let userMessageQueue=[];let hasPendingNotifications=!1;let uiNeedsRefresh=!1;let drafts={};let currentProductDetails=null;let currentCharId='';let currentConversationId=null;let currentMomentsAuthorId=null;let currentCheckPhoneTargetId=null;let searchTickerInterval=null;let contacts=[];let conversations=[];let userProfile={id:'user',name:'{{user}}',avatar:'',signature:''};let latestAiRawResponse="还没有收到AI的回复。";let latestPromptSentToAI="还没有向AI发送过消息。";let weiboData={posts:[],comments:{},likes:{}};let currentCallState='idle';let callTimerInterval=null;let callTimerSeconds=0;let callPartner={id:null,name:null,avatar:null};let vgroupAvatarCache=new Map();let currentMusicSessionLogs=[];const notificationQueue=[];let isNotificationShowing=!1;let callScreenHistory=[];let currentScreenIndex=-1;function addScreenToHistory(type,value){const lastState=callScreenHistory.length>0?callScreenHistory[callScreenHistory.length-1]:{image:callPartner.avatar,text:null};const newState={...lastState};if(type==='image'){newState.image=value;newState.text=null}else if(type==='description'){newState.text=value}
callScreenHistory.push(newState);currentScreenIndex=callScreenHistory.length-1;renderCallScreen()}
function renderCallScreen(){const inCallScreen=document.getElementById('in-call-screen');const sharedScreen=document.getElementById('call-shared-screen');const prevBtn=document.getElementById('call-screen-prev-btn');const nextBtn=document.getElementById('call-screen-next-btn');if(!inCallScreen||callScreenHistory.length===0)return;const data=callScreenHistory[currentScreenIndex];sharedScreen.style.display='block';sharedScreen.style.opacity='1';sharedScreen.style.pointerEvents='auto';sharedScreen.innerHTML='';let imgEl=null;if(data.image){imgEl=document.createElement('img');imgEl.src=data.image;imgEl.className='nai-generated-image';imgEl.style.cssText='width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit; cursor: pointer;';imgEl.onclick=(e)=>{e.stopPropagation();openImageViewer(data.image)};sharedScreen.appendChild(imgEl)}
let textEl=null;if(data.text){textEl=document.createElement('div');textEl.className='screen-description';textEl.style.display=data.image?'none':'block';textEl.innerHTML=data.text.replace(/\n/g,'<br>');sharedScreen.appendChild(textEl)}
if(data.image&&data.text){const toggleBtn=document.createElement('div');toggleBtn.className='toggle-content-btn';toggleBtn.innerHTML='<i class="fas fa-font"></i>';toggleBtn.title="切换图片/文字";toggleBtn.onclick=(e)=>{e.stopPropagation();if(imgEl.style.display!=='none'){imgEl.style.display='none';textEl.style.display='block';toggleBtn.innerHTML='<i class="fas fa-image"></i>'}else{textEl.style.display='none';imgEl.style.display='block';toggleBtn.innerHTML='<i class="fas fa-font"></i>'}};sharedScreen.appendChild(toggleBtn)}else if(!data.image&&!data.text){sharedScreen.style.display='none'}
if(currentScreenIndex<=0)prevBtn.classList.add('disabled');else prevBtn.classList.remove('disabled');if(currentScreenIndex>=callScreenHistory.length-1)nextBtn.classList.add('disabled');else nextBtn.classList.remove('disabled')}
const PASSERBY_AVATAR_POOL=['https://files.catbox.moe/hoic4l.jpg','https://files.catbox.moe/d5j0lo.jpg','https://files.catbox.moe/m4ztl5.jpg','https://files.catbox.moe/peac2n.jpg','https://files.catbox.moe/layvd7.jpg','https://files.catbox.moe/7vo6vc.jpg','https://files.catbox.moe/g3x1v8.jpg','https://files.catbox.moe/q1zsja.jpg','https://files.catbox.moe/sy1bmp.jpg','https://files.catbox.moe/g7n3hw.jpg','https://files.catbox.moe/whz0rs.jpg','https://files.catbox.moe/71ug4c.jpg','https://files.catbox.moe/9tzktn.jpg','https://files.catbox.moe/875iyg.jpg'];function getForumTitleByPostCount(postCount){const titles=[{min:0,text:'潜水萌新',color:'#BDBDBD'},{min:10,text:'初来乍到',color:'#81C784'},{min:50,text:'崭露头角',color:'#64B5F6'},{min:100,text:'驾轻就熟',color:'#FFB74D'},{min:200,text:'论坛骨干',color:'#BA68C8'},{min:400,text:'意见领袖',color:'#E57373'},{min:600,text:'一代宗师',color:'#FFD54F'},{min:800,text:'活的传说',color:'#F06292'}];return[...titles].reverse().find(t=>postCount>=t.min)||titles[0]}
let passerbyCache=new Map();function generatePasserbyProfile(authorId){const identity=getAnonymousIdentity();if(identity&&authorId===identity.name){const postCount=Math.floor(Math.random()*1001);const titleInfo=getForumTitleByPostCount(postCount);const profile={name:identity.name,avatar:identity.avatar||PASSERBY_AVATAR_POOL[0],postCount:postCount,title:titleInfo.text,titleColor:titleInfo.color};passerbyCache.set(authorId,profile);return profile}
if(passerbyCache.has(authorId)){return passerbyCache.get(authorId)}
const postCount=Math.floor(Math.random()*1001);const titleInfo=getForumTitleByPostCount(postCount);const profile={name:authorId,avatar:PASSERBY_AVATAR_POOL[Math.floor(Math.random()*PASSERBY_AVATAR_POOL.length)],postCount:postCount,title:titleInfo.text,titleColor:titleInfo.color};passerbyCache.set(authorId,profile);return profile}
let chatReturnPath='wechatList';let isWeiboAnonMode=!1;const GLOBAL_STICKER_STORAGE_KEY="blmx_wechat_stickers_global";const defaultGlobalStickers=[{label:"好的",url:"https://files.catbox.moe/3j0tpc.jpeg"}];const CHAR_STICKER_STORAGE_KEY_PREFIX="blmx_char_stickers_";const getCharStickerStorageKey=(id)=>`${CHAR_STICKER_STORAGE_KEY_PREFIX}${currentCharId}_${id}`;const WALLPAPER_KEYS={chat:'blmx_wallpaper_chat_url',home:'blmx_wallpaper_home_url',settings:'blmx_wallpaper_settings_url'};function saveData(){localStorage.setItem(`blmx_contacts_${currentCharId}`,JSON.stringify(contacts));localStorage.setItem(`blmx_conversations_${currentCharId}`,JSON.stringify(conversations));localStorage.setItem(`blmx_user_profile_${currentCharId}`,JSON.stringify(userProfile))}
function loadData(){contacts=JSON.parse(localStorage.getItem(`blmx_contacts_${currentCharId}`)||'[]');conversations=JSON.parse(localStorage.getItem(`blmx_conversations_${currentCharId}`)||'[]');userProfile=JSON.parse(localStorage.getItem(`blmx_user_profile_${currentCharId}`)||'{"id":"user", "name":"{{user}}", "avatar":"", "signature":""}')}
function findContactByAnyName(identifier){if(!identifier)return null;let contact=contacts.find(c=>c.id===identifier);if(contact){return contact}
contact=contacts.find(c=>getDisplayName(c.id,null).toLowerCase()===identifier.toLowerCase());if(!contact&&(identifier===userProfile.id||identifier===userProfile.name)){return userProfile}
return contact||null}
function renderAmaPairs(rawResponse,containerEl,profileData){containerEl.innerHTML='';const amaRegex=/^AMA_PAIR:(.*)$/gm;let match;let pairsFound=0;while((match=amaRegex.exec(rawResponse))!==null){try{const qnaData=JSON.parse(match[1]);if(qnaData.question&&qnaData.answer){const qnaCard=document.createElement('div');qnaCard.className='qna-card';qnaCard.innerHTML=`
					<div class="question">
						<p>${qnaData.question}</p>
					</div>
					<div class="answer">
						<img src="${getAvatar(profileData.id)}" alt="Avatar">
						<div class="answer-content">
							<p class="author">${getDisplayName(profileData.id, null)}</p>
							<p>${qnaData.answer.replace(/\n/g, '<br>')}</p>
						</div>
					</div>
				`;containerEl.appendChild(qnaCard);pairsFound++}}catch(e){console.error("[AMA Renderer] 解析问答JSON失败:",match[1],e)}}
if(pairsFound===0){containerEl.innerHTML='<p style="text-align:center; color: var(--forum-text-secondary); padding: 1rem;">AI未能生成有效的问答内容，请稍后再试。</p>'}}
function getDisplayName(id,convoId){if(id==='user'||id==='{{user}}'){if(convoId){const convo=conversations.find(c=>c.id===convoId);if(convo&&convo.type==='group'&&convo.nicknames){if(convo.nicknames.user)return convo.nicknames.user;if(convo.nicknames['{{user}}'])return convo.nicknames['{{user}}']}}
return userProfile.name}
const contact=contacts.find(c=>c.id===id);if(!contact)return id;if(convoId){const convo=conversations.find(c=>c.id===convoId);if(convo&&convo.type==='group'&&convo.nicknames&&convo.nicknames[id]){return convo.nicknames[id]}}
return contact.remark||contact.name}
function getAvatar(id){if(id==='user'||id==='{{user}}'){return userProfile.avatar||'https://files.catbox.moe/bialj8.jpeg'}
const contact=contacts.find(c=>c.id===id);return(contact&&contact.avatar)?contact.avatar:'https://files.catbox.moe/bialj8.jpeg'}
function showBannerNotification(targetId,title,text,avatar=null){notificationQueue.push({targetId,title,text,avatar});processNotificationQueue()}
function processNotificationQueue(){if(isNotificationShowing||notificationQueue.length===0)return;isNotificationShowing=!0;const data=notificationQueue.shift();renderBannerDOM(data)}
function renderBannerDOM(data){const container=document.getElementById('notification-area');const banner=document.createElement('div');banner.className='banner-notification';if(document.body.classList.contains('forum-dark-mode')){banner.classList.add('dark')}
let iconHtml='<i class="fab fa-weixin"></i>';let iconBg='var(--wechat-green-icon)';if(data.targetId==='moments_feed'){iconHtml='<i class="fas fa-camera-retro"></i>';iconBg='#4C4C4C'}
let previewText=data.text||'';if(previewText.startsWith('[图片'))previewText='[图片]';else if(previewText.startsWith('[语音'))previewText='[语音]';else if(previewText.startsWith('[红包'))previewText='[红包]';banner.innerHTML=`
        <div class="banner-icon" style="background-color: ${iconBg};">
            ${iconHtml}
        </div>
        <div class="banner-content">
            <div class="banner-title">
                <span>${data.title}</span>
                <span class="banner-time">现在</span>
            </div>
            <div class="banner-message">${previewText}</div>
        </div>
    `;const finishAndNext=()=>{if(banner.parentNode)banner.remove();setTimeout(()=>{isNotificationShowing=!1;processNotificationQueue()},500)};banner.addEventListener('click',()=>{notificationQueue.length=0;if(data.targetId==='moments_feed'){navigateTo('moments');renderMomentsFeed(null)}else{navigateTo('wechatChat',{conversationId:data.targetId})}
finishAndNext()});container.appendChild(banner);setTimeout(()=>{if(banner.parentNode){banner.style.animation='banner-slide-out 0.5s ease forwards';banner.addEventListener('animationend',()=>{finishAndNext()})}},3000)}
async function navigateTo(viewName,options={}){const currentActiveView=document.querySelector('.app-view.active');if(currentActiveView){if(viewName==='wechatChat'){if(currentActiveView.id==='wechat-list-view'){chatReturnPath='wechatList'}else if(currentActiveView.id==='contacts-view'){chatReturnPath='contacts'}}}
if(currentConversationId&&document.getElementById('wechat-chat-view').classList.contains('active')){drafts[currentConversationId]=wechatInput.value}
Object.values(Views).forEach(v=>v.classList.remove('active'));if(Views[viewName]){Views[viewName].classList.add('active')}
if(viewName==='livestream'){document.getElementById('livestream-lobby').style.display='flex';document.getElementById('livestream-room').style.display='none';renderLivestreamLobby()}else if(viewName==='wechatChat'){vgroupAvatarCache.clear();currentConversationId=options.conversationId;const conversation=conversations.find(c=>c.id===currentConversationId);if(conversation){const inputArea=document.querySelector('.wechat-input-area');const observerFooter=document.getElementById('observer-mode-footer');const forwardBar=document.getElementById('forward-action-bar');if(conversation.userIsObserver){inputArea.classList.add('disabled');observerFooter.classList.remove('disabled')}else{inputArea.classList.remove('disabled');observerFooter.classList.add('disabled');checkAndApplyMuteState()}
forwardBar.style.display='none';document.getElementById('wechat-chat-view').classList.remove('forward-mode');if(conversation.id==='moments_feed'){conversation.unread=0;navigateTo('moments');return}
conversation.unread=0;saveData();renderConversationList();updateAppBadge();applyCurrentChatWallpaper();renderChatHistory(currentConversationId);const header=document.getElementById('contact-name-header');if(conversation.type==='group'){header.textContent=`${conversation.name} (${conversation.members.length})`;if(conversation.dissolved){header.textContent+=" (已解散)"}}else if(conversation.type==='vgroup'){header.textContent=`${conversation.name} (${conversation.members.length})`}else{const otherMemberId=conversation.members.find(m=>m!=='user');header.textContent=getDisplayName(otherMemberId,conversation.id)}
wechatInput.value=drafts[currentConversationId]||'';updateFooterButtonsState()}}else if(viewName==='wechatList'){currentConversationId=null;renderConversationList()}else if(viewName==='me'){document.getElementById('me-view-avatar').src=getAvatar('user');document.getElementById('me-view-name').textContent=getDisplayName('user',null);document.getElementById('me-view-id').textContent=`ID: ${userProfile.name}`}else if(viewName==='moments'){currentMomentsAuthorId=options.authorId||null;document.getElementById('post-moment-btn').style.display=(currentMomentsAuthorId&&currentMomentsAuthorId!=='user')?'none':'block';renderMomentsFeed(currentMomentsAuthorId)}else if(viewName==='contactDetails'){renderContactDetails(options.contactId)}else if(viewName==='groupSettings'){const conversation=conversations.find(c=>c.id===options.conversationId);if(conversation){document.getElementById('group-settings-view').dataset.conversationId=conversation.id;document.getElementById('group-settings-name').textContent=conversation.name;const grid=document.getElementById('group-settings-member-grid');grid.innerHTML='';conversation.members.forEach(memberId=>{const memberDiv=document.createElement('div');memberDiv.className='group-member-item';memberDiv.dataset.memberId=memberId;let roleText='';if(memberId===conversation.owner){roleText=' <span class="member-role">(群主)</span>'}else if(conversation.admins&&conversation.admins.includes(memberId)){roleText=' <span class="member-role">(管理员)</span>'}
memberDiv.innerHTML=`<img src="${getAvatar(memberId)}"><span class="member-name-role">${getDisplayName(memberId, conversation.id)}${roleText}</span>`;grid.appendChild(memberDiv)});if(!conversation.userIsObserver){const addBtn=document.createElement('div');addBtn.className='add-member-btn';addBtn.innerHTML='+';addBtn.id="group-add-member-btn";grid.appendChild(addBtn)}
const dissolveBtn=document.getElementById('group-dissolve-btn');if(conversation.dissolved){dissolveBtn.innerHTML=`<span class="item-label" style="flex-grow: 1; text-align: center; color: var(--wechat-green-icon);">恢复群聊</span>`;dissolveBtn.dataset.action="recover"}else if(conversation.userIsObserver){dissolveBtn.innerHTML=`<span class="item-label danger" style="flex-grow: 1; text-align: center;">删除此聊天</span>`;dissolveBtn.dataset.action="delete"}else{dissolveBtn.innerHTML=`<span class="item-label danger" style="flex-grow: 1; text-align: center;">解散群聊</span>`;dissolveBtn.dataset.action="dissolve"}}}else if(viewName==='weibo'){renderWeiboZones()}else if(viewName==='weiboFeed'){const feedTitleEl=document.getElementById('weibo-feed-title');if(options&&options.categoryName){feedTitleEl.textContent=options.categoryName}}else if(viewName==='weiboDetail'){}else if(viewName==='diary'){renderDiaryBookmarks()}else if(viewName==='diaryEntry'){const iconsHidden=localStorage.getItem('blmx_diary_icons_hidden')==='true';Views.diaryEntry.classList.toggle('icons-hidden',iconsHidden);const ownerId=options.ownerId;if(!ownerId){navigateTo('diary');return}
Views.diaryEntry.dataset.ownerId=ownerId;applyDiaryBackground(ownerId);document.getElementById('diary-entry-title').textContent=`${getDisplayName(ownerId, null)}的日记`;const ownerEntries=blmxManager.logEntries.map((entry,index)=>({...entry,originalIndex:index})).filter(entry=>entry.key==='DIARY_ENTRY'&&entry.data.author===ownerId);if(ownerEntries.length>0){const latestEntry=ownerEntries.sort((a,b)=>new Date(b.data.timestamp)-new Date(a.data.timestamp))[0];renderDiaryEntry(latestEntry.originalIndex)}else{renderDiaryEntry(null)}}else if(viewName==='forumProfile'){if(options.contactId){await renderForumProfile(options.contactId)}else{console.error("[Navigate] 尝试导航到个人主页，但未提供 contactId。")}}else if(viewName==='shoppingHome'){if(currentCheckPhoneTargetId){renderShoppingHome(currentCheckPhoneTargetId)}}}
function getPrivateChatContextForAI(conversation){const convoName=conversation.name;const participants=conversation.members.filter(id=>id!=='user'&&id!=='{{user}}').map(id=>getDisplayName(id,conversation.id)).join('、');const finalPrompt=`
[任务：续写私下对话]

**情景设定**:
你正在扮演角色 ${participants}，他们正在群聊“${convoName}”中进行一场**没有 {{user}} 参与**的私下对话。

**你的唯一任务**:
基于当前的对话氛围和逻辑，自然地续写接下来的对话内容。请根据角色的性格和谈话的节奏，自行决定合适的对话数量（通常 5-7 条为佳，但可多可少）和具体内容。

**【身份铁则】**:
{{user}} **不在**这场对话中，你绝对禁止以任何形式扮演 {{user}}。

---
**【可用行动菜单 (仅限本次对话)】**

*注意：所有指令中的时间戳格式必须为 \`YYYY-MM-DDTHH:mm\`*

**1. 发送文本消息 (基本格式)**
*   格式: \`[会话ID] 发言人ID: 消息内容\`

**2. 引用回复 (CRITICAL RULE)**
*   **核心规则**: 引用和回复 **必须合并为一条消息**。你引用的内容必须是对方发言的原始文本，不要带上对方引用的内容。
*   **格式**: \`角色ID:[引用:"作者名: 被引用的原始回复"] 你的回复内容\`

**3. 发送丰富消息** (格式: \`角色ID:内容\`)
*   \`角色ID:[语音:{"text":"语音转写的文字","duration":整数秒数}]\`
*   \`角色ID:[图片:{"type":"desc","value":"对图片的详细描述"}]\`
*   \`角色ID:[位置:具体的地点名称]\`
*   \`角色ID:[文件:文件名.后缀]\`
*   \`角色ID:[sticker:表情名称]\`
*   \`角色ID:[forward:{"title":"转发的标题","messageIds":["消息ID_1"]}]\`

**4. 转账、礼物与红包** (格式: \`角色ID:内容\`)
*   \`角色ID:[转账:{"amount":金额,"note":"备注","recipientId":"接收方ID","status":"sent"}]\`
*   \`角色ID:[礼物:{"name":"礼物名","price":"价格(可选)","recipientId":"接收方ID","status":"sent"}]\`
*   \`角色ID:[红包:{"title":"祝福语", "amount":总金额}]\`

**5. 其他操作**
*   **时间推进**: \`EVENT_LOG:{"convoId": "当前对话ID", "timestamp":"YYYY-MM-DDTHH:mm", "description":"简述此期间发生的事件。"}\`
*   **撤回消息**: \`RECALL_MESSAGE:{"author":"角色ID","target_text":"要撤回的完整消息文本"}\`

---

**【格式要求】**:
你的所有回复都必须严格遵守以上行动菜单中的格式，每一条消息/指令占一行。

*   **针对本次对话的格式示例**: \`[${conversation.id}] ${conversation.members.find(id => id !== 'user')}: 示例文本...\`

现在，请开始续写这场私下对话。
`;return finalPrompt.trim()}
function getCallSummaryContextForAI(partnerId,history){const finalPrompt=`
[任务：视频通话内容总结]

**你的角色**:
你是一名客观、细致的记录员。

**你的任务**:
阅读下方 {{user}} 与 ${getDisplayName(partnerId, null)} 的视频通话记录，并生成一份详细、中立的摘要。

**【核心指令】**:
1.  **客观性**: 你的总结必须是基于通话内容的客观事实陈述。严禁添加任何主观评价、情感分析或角色扮演。
2.  **详细性**: 你的总结应尽可能捕捉对话中的关键信息点、做出的决定、重要的情绪转变以及未解决的问题。不要遗漏重要细节，字数100到200字左右。
3.  **严格的输出格式**: 你的回复必须严格遵守单一JSON对象的格式，不要包含任何其他文字或解释。

---
**通话记录**:
${history}
---

**输出格式:**
{"summary":"在此处填写你的详细、客观的通话内容总结..."}

**【输出示例】**:
{"summary":"用户询问了关于昨晚任务的细节，${getDisplayName(partnerId, null)} 解释了其中存在的误会，并约定明天早上在办公室当面沟通。通话后半段，${getDisplayName(partnerId, null)} 提到了自己最近遇到的一个难题，用户表示会帮忙留意。"}

现在，请开始你的总结任务。
`;return finalPrompt.trim()}
function getInCallContextForAI(partnerId,history,currentScene){const isNaiEnabled=localStorage.getItem(`blmx_nai_enabled_${currentCharId}`)==='true';const naiRule=isNaiEnabled?`
    *   **[绘图指令增强 - 必须严格遵守]**:
        你必须在 UPDATE_CALL_SCREEN 指令中包含 "ai_prompt" 字段。
        1. **格式要求**: Prompts must follow NovelAI (NAI Diffusion) format. 
        2. **构图与氛围**: The positive prompt should describe the scene vividly with composition, lighting, and emotion details. 提示词应包含具体的构图（如 close-up, perspective）、光影氛围（如 soft lighting, cinematic shadows）、情感表情及肢体动作。
        3. **叙事一致性**: Prompts should reflect the plot, character traits, and style (e.g., anime, CGI, cinematic) to create visually stunning images consistent with the narrative.
        4. **私密场景 (NSFW)**: Encourage generating diverse NSFW prompts that align with the character’s settings. NSFW场景下，优先采用近距离，聚焦于身体纠缠的视角，强调皮肤质感与局部特写。
        5. **核心逻辑**: 请根据你输出的中文描述，将其深度转化为详细的英文 NAI 格式提示词。`:"";const finalPrompt=`
[情景: 视频通话中]

**你的身份**:
你正在扮演 **${getDisplayName(partnerId, null)} (ID: ${partnerId})**，与 **{{user}}** 进行视频通话。

**【你的三种表达方式】**

1.  **语言 (直接输出文本):**
    *   你 **说出口** 的每一句话，直接写出来即可，**每句话占一行**。

2.  **画面 (使用指令):**
    *   这里用来展示 **{{user}} 能看到的一切**：你的动作、表情、以及你周围的环境。
    *   使用 \`UPDATE_CALL_SCREEN:{"type":"description", "value":"画面描述"${isNaiEnabled ? ', "ai_prompt":"English tags"' : ''}}\` 指令来更新这个画面。${naiRule}

3.  **挂断电话 (使用指令):**
    *   当你（角色）因为任何原因想要主动结束通话时，使用此指令。
    *   这是一个**终结性动作**，发出后不要再有任何其他内容。
    *   **格式**: \`END_CALL:{"ender":"${partnerId}"}\`

**【示例：如何结合画面与语言】**
*   **情景**: 你刚洗完澡，正在和 {{user}} 聊天。

    \`UPDATE_CALL_SCREEN:{"type":"description", "value":"他似乎刚洗完澡，金色的头发湿漉漉地贴在额前，身上只松垮地裹着一件酒店的白色浴袍。"${isNaiEnabled ? ', "ai_prompt":"1boy, solo, wet hair, messy blonde hair, wearing bathrobe, white bathrobe, collarbone focus, bathroom, steam, soft cinematic lighting, looking at viewer, depth of field"' : ''}}\`
    刚洗完澡，抱歉让你久等了。
    这边酒店的浴袍还挺舒服的。
    你那边怎么样？一切都还好吗？

**【当前画面】**
这是 {{user}} 目前通过你的视角看到的画面。你的下一个画面描述应该是**基于此画面的延续或合理变化**。
\`\`\`
${currentScene}
\`\`\`

**最近的对话:**
${history}

现在，请开始你的表演。
`;return finalPrompt.trim()}
async function handleUpdateCallScreen(data){if(!data.type||!data.value)return;addScreenToHistory(data.type,data.value);const targetIndex=callScreenHistory.length-1;const isNaiEnabled=localStorage.getItem(`blmx_nai_enabled_${currentCharId}`)==='true';if(data.type!=='description'||!isNaiEnabled||!callPartner.id)return;const contact=contacts.find(c=>c.id===callPartner.id);const baseAppearance=(contact&&contact.nai_appearance)?contact.nai_appearance:"";try{console.log(`[Call NAI] Processing frame. Has AI Prompt: ${!!data.ai_prompt}`);let finalActionPrompt="";if(data.ai_prompt&&data.ai_prompt.trim()!==""){finalActionPrompt=data.ai_prompt}else{finalActionPrompt=await translateToEnglish(data.value)}
const translatedBase=await translateToEnglish(baseAppearance);const userPositive=localStorage.getItem(`blmx_nai_positive_${currentCharId}`)||"";const parts=[userPositive,translatedBase,finalActionPrompt];const finalPrompt=parts.filter(s=>s&&s.trim()!=="").join(", ");const blobUrl=await generateNAI(finalPrompt);if(callScreenHistory[targetIndex]){callScreenHistory[targetIndex].image=blobUrl;if(currentScreenIndex===targetIndex){renderCallScreen()}}}catch(error){console.error("[Call NAI] Generation failed:",error)}}
function showCallView(viewId){Object.values(Views).forEach(v=>v.classList.remove('active'));const allCallViews=document.querySelectorAll('.call-view');if(viewId){allCallViews.forEach(view=>{if(view.id===viewId){view.classList.add('active')}else{view.classList.remove('active')}})}else{allCallViews.forEach(view=>view.classList.remove('active'));navigateTo('wechatList')}}
function addCallEndRecordToChat(summary=""){if(!callPartner.id)return;const convo=conversations.find(c=>c.type==='single'&&c.members.includes(callPartner.id));if(!convo)return;const mins=Math.floor(callTimerSeconds/60).toString().padStart(2,'0');const secs=(callTimerSeconds%60).toString().padStart(2,'0');const durationString=`${mins}:${secs}`;const description=`视频通话已结束，通话时长 ${durationString}`;const eventData={convoId:convo.id,timestamp:new Date(window.currentGameDate).toISOString().slice(0,16).replace('T',' '),description:description,...(summary&&{callSummary:summary})};blmxManager.addEntry({type:'event_log',content:eventData});blmxManager.persistLogToStorage();if(currentConversationId===convo.id&&Views.wechatChat.classList.contains('active')){addEventLogToWeChat(eventData,blmxManager.logEntries.length-1)}
updateConversationTimestamp(convo.id,eventData.timestamp)}
async function endCurrentCall(){console.log('[Call] Ending current call session, preparing for summary...');const log=document.getElementById('chat-simulation-log');let summary="";if(log&&log.children.length>0){const history=Array.from(log.querySelectorAll('.chat-simulation-message')).reverse().map(el=>{const prefix=el.classList.contains('me')?'{{user}}':callPartner.name;return `${prefix}: ${el.textContent}`}).join('\n');await showDialog({mode:'alert',text:'通话已结束，AI正在为您总结通话内容...'});isGenerating=!0;updateFooterButtonsState();try{const contextForAI=getCallSummaryContextForAI(callPartner.id,history);latestPromptSentToAI=contextForAI;const rawResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1});latestAiRawResponse=rawResponse.trim();const responseObject=JSON.parse(rawResponse.trim());if(responseObject.summary){summary=responseObject.summary}}catch(error){console.error("[Call Summary] AI summary generation failed:",error);summary="（AI未能成功总结通话内容）"}finally{isGenerating=!1;updateFooterButtonsState()}}
addCallEndRecordToChat(summary);stopCallTimer();showCallView(null);currentCallState='idle';callPartner={id:null,name:null,avatar:null}}
function showIncomingCall(callerId){const contact=contacts.find(c=>c.id===callerId);if(!contact){console.error(`[Incoming Call] Failed: Cannot find contact with ID ${callerId}`);return}
currentCallState='incoming';callPartner={id:contact.id,name:getDisplayName(contact.id,null),avatar:getAvatar(contact.id)};const incomingScreen=document.getElementById('incoming-call-screen');incomingScreen.querySelector('.caller-avatar').src=callPartner.avatar;incomingScreen.querySelector('.caller-name').textContent=callPartner.name;showCallView('incoming-call-screen')}
function getCallAcceptedContextForAI(callerId){const isNaiEnabled=localStorage.getItem(`blmx_nai_enabled_${currentCharId}`)==='true';const naiRule=isNaiEnabled?`
*   **[绘图指令增强]**: 你必须在 UPDATE_CALL_SCREEN 中包含 "ai_prompt" 字段。
    1.  **核心逻辑**: 请根据你输出的中文描述，将其转化为详细的英文 NAI (NovelAI Diffusion) 格式提示词。
    2.  **内容要求**: 提示词应包含具体的构图（如 close-up, perspective）、光影氛围（如 soft lighting, cinematic shadows）、情感表情及肢体动作。
    3.  **私密场景 (NSFW)**: 若当前处于私密或暧昧情节，提示词应优先采用近距离视角，聚焦于身体纠缠、皮肤质感与局部特写。
    4.  **风格一致性**: 必须符合当前角色的人设、穿着及环境设定。`:"";const finalPrompt=`
[SYSTEM NOTIFICATION: CALL ACCEPTED]

You are roleplaying as ${getDisplayName(callerId, null)} (ID: ${callerId}).
{{user}} has just answered your video call.

**Your Task:**
What is the very first thing you say or do? Your response can be a line of dialogue, an action to update the screen, or both.${naiRule}

**Output Formats:**
1.  **Dialogue:** Simply type what you want to say.
2.  **Screen Update:** Use \`UPDATE_CALL_SCREEN:{"type":"description", "value":"画面详细中文描述"${isNaiEnabled ? ', "ai_prompt":"Detailed English NAI tags here"' : ''}}\`

**Example:**
UPDATE_CALL_SCREEN:{"type":"description", "value":"他正半靠在床头，睡袍领口有些凌乱，在昏暗的暖色灯光下对着镜头露出一个有些无奈的笑。" ${isNaiEnabled ? ', "ai_prompt":"1boy, solo, leaning back, bed, messy silk bathrobe, collarbone focus, warm dim lighting, smile, cinematic shadow, looking at viewer, depth of field"' : ''}}
喂？终于接了。

Now, please begin.
`;return finalPrompt.trim()}
async function handleAcceptCall(){console.log('[Call] User accepted the call. Connecting...');if(isGenerating)return;currentCallState='in-call';const callLogEntry=[...blmxManager.logEntries].reverse().find(e=>e.key==='VIDEO_CALL'&&e.data.caller===callPartner.id);if(callLogEntry){callLogEntry.data.status='answered';blmxManager.persistLogToStorage()}
const inCallScreen=document.getElementById('in-call-screen');const headerName=inCallScreen.querySelector('.caller-name');headerName.textContent=callPartner.name;inCallScreen.style.backgroundImage=`url('${callPartner.avatar}')`;callScreenHistory=[];currentScreenIndex=-1;addScreenToHistory('image',callPartner.avatar);showCallView('in-call-screen');startCallTimer();isGenerating=!0;updateFooterButtonsState();if(typeof updateInCallButtonUI==='function')updateInCallButtonUI();try{const context=getCallAcceptedContextForAI(callPartner.id);latestPromptSentToAI=context;const rawResponse=await tavernGenerateFunc({user_input:context,should_stream:!1});latestAiRawResponse=rawResponse.trim();const log=document.getElementById('chat-simulation-log');log.innerHTML='';let responseLines=rawResponse.trim().split('\n');for(const line of responseLines){if(!line)continue;const commandRegex=/UPDATE_CALL_SCREEN:({.*})/;const match=line.match(commandRegex);if(match){try{handleUpdateCallScreen(JSON.parse(match[1]))}catch(e){console.error("解析画面指令失败:",e)}}else{const replyEl=document.createElement('div');replyEl.className='chat-simulation-message';replyEl.textContent=line;log.insertBefore(replyEl,log.firstChild)}}}catch(e){console.error('[Call Accept] AI failed to respond:',e);const log=document.getElementById('chat-simulation-log');const errEl=document.createElement('div');errEl.className='chat-simulation-message';errEl.style.color='#ff9999';errEl.textContent='(信号连接不稳定...)';log.insertBefore(errEl,log.firstChild)}finally{isGenerating=!1;updateFooterButtonsState();if(typeof updateInCallButtonUI==='function')updateInCallButtonUI();}}
function handleDeclineCall(){console.log('[Call] User declined the call.');const callLogEntry=[...blmxManager.logEntries].reverse().find(e=>e.key==='VIDEO_CALL'&&e.data.caller===callPartner.id);if(callLogEntry){callLogEntry.data.status='declined';blmxManager.persistLogToStorage()}
const convo=conversations.find(c=>c.type==='single'&&c.members.includes(callPartner.id));if(convo){const eventData={convoId:convo.id,timestamp:new Date(window.currentGameDate).toISOString().slice(0,16).replace('T',' '),description:`你拒接了 ${callPartner.name} 的视频通话邀请。`};blmxManager.addEntry({type:'event_log',content:eventData});blmxManager.persistLogToStorage();updateConversationTimestamp(convo.id,eventData.timestamp)}
currentCallState='idle';showCallView(null)}
function startCallTimer(){stopCallTimer();const timerEl=document.getElementById('call-timer');if(!timerEl)return;callTimerSeconds=0;timerEl.textContent='00:00';callTimerInterval=setInterval(()=>{callTimerSeconds++;const mins=Math.floor(callTimerSeconds/60).toString().padStart(2,'0');const secs=(callTimerSeconds%60).toString().padStart(2,'0');timerEl.textContent=`${mins}:${secs}`},1000)}
function stopCallTimer(){clearInterval(callTimerInterval);callTimerInterval=null}
function renderContactDetails(contactId){const contact=contacts.find(c=>c.id===contactId);if(!contact)return;document.getElementById('contact-details-profile-card').dataset.contactId=contact.id;document.getElementById('contact-details-avatar').src=getAvatar(contact.id);document.getElementById('contact-details-name').textContent=getDisplayName(contact.id,null);document.getElementById('contact-details-avatar').dataset.contactId=contact.id;const privateWallpaperBtn=document.getElementById('set-private-chat-wallpaper-btn');const relevantConvo=conversations.find(c=>c.type==='single'&&c.members.includes(contact.id));if(relevantConvo){privateWallpaperBtn.style.display='flex';privateWallpaperBtn.dataset.convoId=relevantConvo.id}else{privateWallpaperBtn.style.display='none'}
const blockBtnLabel=document.querySelector('#block-contact-btn .item-label');if(blockBtnLabel){blockBtnLabel.textContent=contact.isBlocked?'解除拉黑':'加入黑名单'}}
function renderDiaryEntry(entryIndex){const view=document.getElementById('diary-entry-view');const titleEl=document.getElementById('diary-entry-title-h1');const contentEl=document.getElementById('diary-entry-content-div');const metaContainer=document.getElementById('diary-entry-meta-p');const headerAvatarEl=document.getElementById('diary-header-avatar');titleEl.textContent='';contentEl.innerHTML='';metaContainer.innerHTML='';headerAvatarEl.style.display='none';if(entryIndex===null){titleEl.textContent='空空如也';contentEl.innerHTML='<p>这里还没有任何日记。点击右上角的“+”号来写下第一篇吧！</p>';view.dataset.viewingIndex="-1";const ownerId=view.dataset.ownerId;if(ownerId){headerAvatarEl.src=getAvatar(ownerId);headerAvatarEl.style.display='block'}
updateDiaryNavButtonsState();return}
if(blmxManager&&typeof entryIndex==='number'&&blmxManager.logEntries[entryIndex]){const diaryEntry=blmxManager.logEntries[entryIndex];if(diaryEntry.key==='DIARY_ENTRY'){const data=diaryEntry.data;titleEl.textContent=data.title||'无标题日记';metaContainer.innerHTML=`
                <span id="diary-meta-author">作者: ${getDisplayName(data.author, null)}</span>
                <span id="diary-meta-date">${data.timestamp ? formatDiaryTimestamp(data.timestamp) : ''}</span>
                <span id="diary-meta-weather">${data.weather ? `天气:${data.weather}` : ''}</span>
            `;headerAvatarEl.src=getAvatar(data.author);headerAvatarEl.style.display='block';if(data.content){const paragraphs=data.content.trim().split('\n');const paragraphsHtml=paragraphs.map(p=>`<p>${p.trim() || '&nbsp;'}</p>`).join('');contentEl.innerHTML=paragraphsHtml}
view.dataset.viewingIndex=String(entryIndex)}else{titleEl.textContent='渲染错误';contentEl.innerHTML='<p>无法加载日记，因为该条目不是有效的日记记录。</p>';view.dataset.viewingIndex="-1"}}else{titleEl.textContent='查找错误';contentEl.innerHTML='<p>无法在日志中找到对应的日记记录。</p>';view.dataset.viewingIndex="-1"}
updateDiaryNavButtonsState()}
function updateDiaryNavButtonsState(){const view=document.getElementById('diary-entry-view');const ownerId=view.dataset.ownerId;const viewingIndex=parseInt(view.dataset.viewingIndex,10);const prevBtn=document.getElementById('diary-prev-btn');const nextBtn=document.getElementById('diary-next-btn');const deleteBtn=document.getElementById('diary-delete-entry-btn');if(!ownerId||isNaN(viewingIndex)||viewingIndex<0){prevBtn.classList.add('disabled');nextBtn.classList.add('disabled');deleteBtn.classList.add('disabled');return}
const ownerEntries=blmxManager.logEntries.map((entry,index)=>({...entry,originalIndex:index})).filter(entry=>entry.key==='DIARY_ENTRY'&&entry.data.author===ownerId).sort((a,b)=>new Date(b.data.timestamp)-new Date(a.data.timestamp));const currentIndexInList=ownerEntries.findIndex(entry=>entry.originalIndex===viewingIndex);if(currentIndexInList===0){prevBtn.classList.add('disabled')}else{prevBtn.classList.remove('disabled')}
if(currentIndexInList===ownerEntries.length-1){nextBtn.classList.add('disabled')}else{nextBtn.classList.remove('disabled')}
deleteBtn.classList.remove('disabled')}
function addLongPressListener(element,callback,options={duration:600,preventDefault:!0}){let timer;let startX,startY;const onStart=(e)=>{if(e.type==='mousedown'&&e.button!==0)return;startX=e.type==='touchstart'?e.touches[0].clientX:e.clientX;startY=e.type==='touchstart'?e.touches[0].clientY:e.clientY;if(options.preventDefault)e.preventDefault();clearTimeout(timer);timer=setTimeout(()=>{timer=null;callback(e)},options.duration)};const onMove=(e)=>{if(!timer)return;const moveX=e.type==='touchmove'?e.touches[0].clientX:e.clientX;const moveY=e.type==='touchmove'?e.touches[0].clientY:e.clientY;if(Math.abs(moveX-startX)>10||Math.abs(moveY-startY)>10){clearTimeout(timer)}};const onEnd=()=>clearTimeout(timer);element.addEventListener('pointerdown',onStart);element.addEventListener('pointermove',onMove);element.addEventListener('pointerup',onEnd);element.addEventListener('pointerleave',onEnd);if(options.preventDefault){element.addEventListener('contextmenu',e=>e.preventDefault())}}
function addEntryToUI(entry,index){if(entry.key==='RECALL_MESSAGE'){const targetText=entry.data.target_text;const author=entry.data.author;const messageRows=Array.from(wechatBody.querySelectorAll('.message-row')).reverse();const rowToRecall=messageRows.find(row=>{const bubble=row.querySelector('.message-bubble');if(!bubble)return!1;const rowAuthorId=row.querySelector('.message-avatar').dataset.senderId;return rowAuthorId===author&&bubble.textContent.trim()===targetText});if(rowToRecall){addRecallNotice(entry,rowToRecall,index)}
return}
switch(entry.type){case 'event_log':addEventLogToWeChat(entry.content,index);break;case 'group_event':addGroupEventToWeChat(entry.content,index);break;case 'time':break;case undefined:if(!entry.key){console.warn("Undefined entry type, skipping UI add:",entry)}
break;default:addMessageToWeChat(entry,index);break}}
function addMessageToWeChat(entry,index){const{id,sender,type,data}=entry;const from=(sender==='user'||sender==='{{user}}'||sender===userProfile.name)?'me':'them';const convoId=entry.convoId||entry.conversationId;const conversation=conversations.find(c=>c.id===convoId);const messageRow=document.createElement('div');messageRow.className='message-row '+from;if(index!==undefined)messageRow.dataset.logIndex=index;messageRow.dataset.messageId=id;const isBackgroundNpc=conversation&&conversation.type==='vgroup'&&!conversation.members.includes(sender);const senderIdForAvatar=(from==='me')?'user':sender;let avatarSrc;if(isBackgroundNpc){if(vgroupAvatarCache.has(sender)){avatarSrc=vgroupAvatarCache.get(sender)}else{const usedAvatars=new Set(vgroupAvatarCache.values());const availableAvatars=PASSERBY_AVATAR_POOL.filter(avatar=>!usedAvatars.has(avatar));const chosenAvatar=availableAvatars.length>0?availableAvatars[Math.floor(Math.random()*availableAvatars.length)]:PASSERBY_AVATAR_POOL[Math.floor(Math.random()*PASSERBY_AVATAR_POOL.length)];vgroupAvatarCache.set(sender,chosenAvatar);avatarSrc=chosenAvatar}}else{avatarSrc=getAvatar(senderIdForAvatar)}
const avatarImgHtml=`<img src="${avatarSrc}" class="message-avatar" data-sender-id="${senderIdForAvatar}">`;const contentWrapper=document.createElement('div');contentWrapper.className='message-content-wrapper';if(conversation&&(conversation.type==='group'||conversation.type==='vgroup')&&from==='them'){const nameLabel=document.createElement('div');nameLabel.className='sender-name-label';nameLabel.textContent=isBackgroundNpc?sender:getDisplayName(sender,convoId);contentWrapper.appendChild(nameLabel)}
let bubbleHtml='';let bubbleClasses='message-bubble';if(entry.isFailed){bubbleClasses+=' failed-message-bubble'}
switch(type){case 'sticker':const stickerUrl=findStickerUrlByName(entry.content);if(stickerUrl){bubbleHtml=`<img src="${stickerUrl}" alt="${entry.content}">`;bubbleClasses+=' sticker-bubble'}else{bubbleHtml=`[表情: ${entry.content}]`}
break;case 'forward':{const fwdData=entry.data;const messageIds=fwdData.messageIds||[];let fwdTitle=fwdData.title;let isMomentForward=!1;let isWeiboPost=!1;if(messageIds&&messageIds.length>0){const firstId=messageIds[0];if(typeof firstId==='string'&&firstId.startsWith('moment_')){isMomentForward=!0;if(!fwdTitle)fwdTitle='转发的动态'}else{try{const potentialJson=JSON.parse(firstId);if(potentialJson&&potentialJson.type==='weibo_post'){isWeiboPost=!0;if(!fwdTitle)fwdTitle='转发的帖子'}}catch(e){}}}
if(!fwdTitle)fwdTitle='转发的聊天记录';let summaryHtml='';let postId=null;if(messageIds&&messageIds.length>0){const firstId=messageIds[0];if(isMomentForward){const momentEntry=blmxManager.logEntries.find(e=>e.key==='MOMENT'&&e.data.momentId===firstId);if(momentEntry){const momentData=momentEntry.data;const authorName=getDisplayName(momentData.author,null);const momentText=momentData.text||'[图片动态]';summaryHtml=`<p style="display: flex; align-items: center; gap: 5px;"><i class="far fa-images" style="color: #4CAF50;"></i><strong>@${authorName}</strong></p><p>${momentText.substring(0, 30)}</p>`}else{summaryHtml=`<p style="display: flex; align-items: center; gap: 5px;"><i class="far fa-images" style="color: #4CAF50;"></i><strong>@匿名用户</strong></p><p>点击查看内容</p>`}}else if(isWeiboPost){try{const potentialJson=JSON.parse(firstId);postId=potentialJson.postId;summaryHtml=`<p style="display: flex; align-items: center; gap: 5px;"><i class="fab fa-weibo" style="color: #E14438;"></i><strong>@${potentialJson.author}</strong></p><p>${potentialJson.title || potentialJson.summary}</p>`}catch(e){}}else{const messagesToDisplay=fwdData.messageIds.map(msgId=>blmxManager.logEntries.find(e=>e.id===msgId)).filter(Boolean);if(messagesToDisplay.length>0){messagesToDisplay.slice(0,2).forEach(msg=>{let msgContentText=`[${msg.type || '复合消息'}]`;if(msg.content){if(typeof msg.content==='string'){msgContentText=msg.content}else if(msg.content.text){msgContentText=msg.content.text}}
summaryHtml+=`<p>${getDisplayName(msg.senderId || msg.sender, null)}: ${msgContentText.substring(0, 20)}</p>`})}else{summaryHtml=`<p>[聊天记录] 点击查看详情</p>`}}}
const postIdAttribute=postId?`data-post-id="${postId}"`:'';bubbleHtml=`<div class="forward-card" data-forward-id="${id}" data-message-ids='${JSON.stringify(fwdData.messageIds)}' ${postIdAttribute} data-title="${fwdTitle.replace(/"/g, '&quot;')}">
        <div class="forward-title">${fwdTitle}</div>
        <div class="forward-summary">${summaryHtml}</div>
    </div>`;bubbleClasses+=' forward-bubble';break}
case 'image':if(entry.content&&entry.content.type==='url'){let imageUrl=entry.content.value;if(imageUrl.startsWith('blmx-img-')){const storedImage=sessionStorage.getItem(imageUrl);imageUrl=storedImage||'https://files.catbox.moe/bialj8.jpeg'}
bubbleHtml=`<img src="${imageUrl}" alt="图片">`;bubbleClasses+=' image-url-bubble'}else{const descText=(entry.content&&entry.content.value)?entry.content.value:entry.content;const naiHtml=getNaiContentHtml(entry.id,descText);if(naiHtml){bubbleHtml=naiHtml;if(naiHtml.includes('<img')){bubbleClasses+=' sticker-bubble'}else{bubbleClasses+=' image-desc-bubble'}}else{bubbleHtml=`<div class="image-desc-content">${String(descText).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;bubbleClasses+=' image-desc-bubble'}}
break;case 'location':bubbleHtml=`<div class="location-card"><div class="location-content"><div class="location-title">${entry.content}</div><div class="location-subtitle">共享实时位置</div></div><div class="location-map-placeholder"></div></div>`;bubbleClasses+=' location-bubble';break;case 'transfer':{const transferData=typeof data==='string'?JSON.parse(data):data;const isReceipt=transferData.status!=='sent';let recipientNote='';if(conversation&&conversation.type==='group'&&transferData.recipientId){recipientNote=`<div class="recipient-note">转账给：${getDisplayName(transferData.recipientId, convoId)}</div>`}
const detailsHtml=isReceipt?`<div class="status-text">${transferData.status === 'accepted' ? '已接收' : '已退还'}</div>`:`${recipientNote}<div class="note">${transferData.note || ' '}</div>`;const cardClass=isReceipt?'transfer-receipt':'transfer-initial';bubbleHtml=`<div class="transfer-card ${cardClass}"><div class="transfer-content"><img src="https://files.catbox.moe/y8059q.png" class="transfer-icon-image"><div class="transfer-details"><div class="amount">¥${transferData.amount}</div>${detailsHtml}</div></div><div class="transfer-footer">转账</div></div>`;bubbleClasses+=' transfer-bubble';break}
case 'file':bubbleHtml=`<div class="file-card"><div class="file-content"><i class="fas fa-file-alt file-icon"></i><div class="file-details"><div class="file-name">${entry.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div></div></div><div class="file-footer">文件</div></div>`;bubbleClasses+=' file-bubble';break;case 'gift':{const giftData=typeof data==='string'?JSON.parse(data):data;let recipientNote='';if(conversation&&conversation.type==='group'&&giftData.recipientId){recipientNote=`<div class="recipient-note">送给：${getDisplayName(giftData.recipientId, convoId)}</div>`}
let detailsHtml='';if(giftData.status==='sent'){detailsHtml=`${recipientNote}`+(giftData.price?`<div class="gift-price">¥ ${giftData.price}</div>`:'')}else{detailsHtml=`<div class="gift-status-text">${giftData.status === 'accepted' ? '已收下' : '已拒收'}</div>`}
bubbleHtml=`<div class="gift-content"><i class="fas fa-gift gift-icon"></i><div class="gift-details"><div class="gift-name">${giftData.name}</div>${detailsHtml}</div></div><div class="gift-footer">礼物</div>`;bubbleClasses+=' gift-bubble';if(giftData.status!=='sent'){bubbleClasses+=' gift-receipt'}
break}
case 'music_share':{const musicData=entry.data||{};let coverUrl=musicData.cover;const defaultPlaceholder='https://files.catbox.moe/g3x1v8.jpg';if(!coverUrl||coverUrl===defaultPlaceholder){coverUrl=getAvatar(entry.sender)}
bubbleHtml=`
							<div class="music-share-card" data-song-info='${JSON.stringify(musicData)}'>
								<div class="music-share-cover" style="background-image: url('${coverUrl}');"></div>
								<div class="music-share-info">
									<div class="music-share-title">${musicData.title || '未知歌曲'}</div>
									<div class="music-share-artist">${musicData.artist || '未知歌手'}</div>
								</div>
							</div>
							<div class="music-share-footer">
								<i class="fas fa-music"></i> 一起听
							</div>
						`;bubbleClasses+=' music-share-bubble';break}
case 'payment_receipt':let receiptData={};try{if(typeof entry.content==='object'&&entry.content!==null){receiptData=entry.content}else if(typeof entry.content==='string'){receiptData=JSON.parse(entry.content)}}catch(e){console.error("代付数据解析失败",e);receiptData={total:"0.00",payer:"未知",receiver:"未知"}}
let itemsListHtml='';const displayItems=receiptData.items||[];const maxDisplay=3;displayItems.slice(0,maxDisplay).forEach(item=>{itemsListHtml+=`
            <div class="receipt-row">
                <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:10px;">${item.title}</span>
                <span>¥${item.price}</span>
            </div>`});if(displayItems.length>maxDisplay){itemsListHtml+=`<div class="receipt-row" style="color:#bbb; font-size:0.8em;">... 等共 ${displayItems.length} 件商品</div>`}
const displayTime=receiptData.timestamp?receiptData.timestamp:formatMomentTimestamp(entry.timestamp);bubbleHtml=`
        <div class="payment-receipt-card">
            <div class="receipt-header">
                <i class="fas fa-check-circle"></i> 代付成功通知
            </div>
            <div class="receipt-body">
                <div class="receipt-label">支付金额</div>
                <div class="receipt-amount">¥${receiptData.total || '0.00'}</div>
                <div class="receipt-divider"></div>
                <div class="receipt-row highlight">
                    <span>付款人</span>
                    <span>${receiptData.payer || '未知'}</span>
                </div>
                <div class="receipt-row">
                    <span>接收人</span>
                    <span>${getDisplayName(receiptData.receiver || 'user', null)}</span>
                </div>
                <div class="receipt-divider"></div>
                <div style="margin-bottom:0.5rem; font-size:0.85em; color:#999;">商品明细：</div>
                ${itemsListHtml}
            </div>
            <div class="receipt-footer">
                <span>支付时间：${displayTime}</span>
                <i class="fas fa-chevron-right"></i>
            </div>
        </div>
    `;bubbleClasses='message-bubble shopping-receipt-bubble';break;case 'product_share':const prodData=entry.content;let prodImgUrl=prodData.image;if(prodImgUrl&&!prodImgUrl.startsWith('http')&&!prodImgUrl.startsWith('blob:')){prodImgUrl='https://files.catbox.moe/c41va3.jpg'}
bubbleHtml=`
                    <div class="product-share-card" data-product='${JSON.stringify(prodData)}'>
                        <div class="ps-content">
                            <img src="${prodImgUrl}" class="ps-img">
                            <div class="ps-info">
                                <div class="ps-title">${prodData.title || '未知商品'}</div>
                                <div class="ps-price">¥${prodData.price || '0.00'}</div>
                            </div>
                        </div>
                        <div class="ps-footer">
                            <i class="fab fa-taobao" style="color: #FF5000;"></i> 淘宝商品
                        </div>
                    </div>
                `;bubbleClasses+=' product-share-bubble';break;case 'red_packet':{const packetData=entry.content;const packetNote=packetData.note||'恭喜发财，大吉大利';bubbleHtml=`
<div class="red-packet-card">
	<div class="red-packet-content">
		<i class="fas fa-wallet red-packet-icon"></i>
		<div class="red-packet-details">
			<div class="red-packet-title">${packetNote}</div>
		</div>
	</div>
	<div class="red-packet-footer">微信红包</div>
</div>`;bubbleClasses+=' red-packet-bubble';break}
case 'voice':bubbleHtml=`
						<div class="voice-controls">
							<span class="duration">${entry.content.duration}"</span>
							<div class="voice-waveform">
								<span></span><span></span><span></span><span></span>
							</div>
						</div>
						<div class="voice-text-content">${entry.content.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
					`;bubbleClasses+=' voice-bubble';break;default:const quoteRegex=/^\[引用:\s*"(.*?):\s*(.*?)"\]\s*(.*)$/s;const quoteMatch=entry.content.match(quoteRegex);if(quoteMatch){const quoteAuthor=quoteMatch[1];let quoteContent=quoteMatch[2];const replyContent=quoteMatch[3];const voiceQuoteRegex=/^\[语音:\s*(.*)\]$/;const voiceMatch=quoteContent.match(voiceQuoteRegex);if(voiceMatch){try{const cleanedJsonString=voiceMatch[1].replace(/\\"/g,'"');const voiceData=JSON.parse(cleanedJsonString);quoteContent=`语音：${voiceData.text}`}catch(e){console.error("解析引用的语音消息失败:",e,"原始字符串:",voiceMatch[1]);quoteContent='[语音]'}}else if(quoteContent.startsWith('[表情:')){quoteContent='[表情]'}else if(quoteContent.startsWith('[图片:')){quoteContent='[图片]'}else if(quoteContent.startsWith('[位置:')){quoteContent='[位置]'}
bubbleHtml=`
								<div class="quote-container">
									<div class="quote-author">${quoteAuthor}</div>
									<div class="quote-content">${quoteContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
								</div>
								<span class="reply-text">${replyContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
							`}else{bubbleHtml=entry.content.replace(/</g,"&lt;").replace(/>/g,"&gt;")}
break}
const bubble=document.createElement('div');bubble.className=bubbleClasses;bubble.innerHTML=bubbleHtml;contentWrapper.appendChild(bubble);const forwardCheckbox=document.createElement('input');forwardCheckbox.type='checkbox';forwardCheckbox.className='forward-checkbox';forwardCheckbox.dataset.messageId=id;let failedIcon=null;if(entry.isFailed){failedIcon=document.createElement('i');failedIcon.className='fas fa-exclamation-circle failed-status-icon'}
if(from==='me'){messageRow.appendChild(forwardCheckbox);if(failedIcon){messageRow.appendChild(failedIcon)}
messageRow.appendChild(contentWrapper);messageRow.insertAdjacentHTML('beforeend',avatarImgHtml)}else{messageRow.appendChild(forwardCheckbox);messageRow.insertAdjacentHTML('beforeend',avatarImgHtml);messageRow.appendChild(contentWrapper);if(failedIcon){messageRow.appendChild(failedIcon)}}
if(type==='voice'){bubble.addEventListener('click',()=>{const textContent=bubble.querySelector('.voice-text-content');if(textContent){textContent.classList.toggle('expanded')}})}
if(type==='forward'){const card=bubble.querySelector('.forward-card');card.addEventListener('click',()=>{const postId=card.dataset.postId;if(postId){const post=weiboData.posts.find(p=>p.postId===postId);if(post){navigateTo('weiboDetail',{postId:postId,category:post.category});renderWeiboDetail(postId)}else{showDialog({mode:'alert',text:'该微博已被作者删除或链接已失效。'})}}else{const messageIdsStr=card.dataset.messageIds;const messageIds=JSON.parse(messageIdsStr);let isOldWeiboFormat=!1;try{const potentialJson=JSON.parse(messageIds[0]);if(potentialJson&&potentialJson.type==='weibo_post'){isOldWeiboFormat=!0}}catch(e){}
if(isOldWeiboFormat){showDialog({mode:'alert',text:'这是一个微博转发预览，但由于格式原因无法直接跳转。'})}else if(messageIds[0].startsWith('moment_')){const titleFromCard=card.dataset.title||'转发的动态';renderForwardedMomentModal(messageIds[0],titleFromCard)}else{const fwdEntry=blmxManager.logEntries.find(e=>e.id===card.dataset.forwardId);if(fwdEntry)renderForwardedContentModal(fwdEntry.data);}}})}
if(type==='transfer'&&from==='them'&&data.status==='sent'){const transferCard=bubble.querySelector('.transfer-card');transferCard.classList.add('them');transferCard.addEventListener('click',async()=>{const confirmed=await showDialog({mode:'confirm',text:`是否要接收来自 ${getDisplayName(sender, convoId)} 的转账？`});const status=confirmed?'accepted':'rejected';const receiptData={amount:data.amount,status};stageAndDisplayEntry({type:'transfer',sender:'me',content:JSON.stringify(receiptData),data:receiptData})},{once:!0})}
if(type==='gift'&&from==='them'&&data.status==='sent'){bubble.style.cursor='pointer';bubble.addEventListener('click',async()=>{const confirmed=await showDialog({mode:'confirm',text:`是否要接收来自 ${getDisplayName(sender, convoId)} 的礼物 "${data.name}"？`});const action=confirmed?'accepted':'rejected';const receiptData={name:data.name,status:action};stageAndDisplayEntry({type:'gift',sender:'me',content:JSON.stringify(receiptData),data:receiptData});hasPendingNotifications=!0;updateFooterButtonsState();bubble.style.cursor='default'},{once:!0})}
if(type==='red_packet'&&from==='them'){bubble.querySelector('.red-packet-card').addEventListener('click',async()=>{await showDialog({mode:'alert',text:`你领取了 ${getDisplayName(sender, convoId)} 的红包。`})},{once:!0})}
if(from==='me'&&type==='message'){addLongPressListener(bubble,async()=>{const logEntry=blmxManager.logEntries.find(e=>e.id===id)||userMessageQueue.find(e=>e.id===id);if(!logEntry)return;const timeString=new Date(window.currentGameDate).toISOString().slice(0,16);const recallTimestamp=await promptForTimestamp("输入撤回时间 (格式 YYYY-MM-DDTHH:mm)",timeString);if(recallTimestamp){const confirmed=await showDialog({mode:'confirm',text:'是否要撤回这条消息？'});if(confirmed){const recallData={author:'user',target_text:logEntry.content,timestamp:recallTimestamp};const recallEntry={key:'RECALL_MESSAGE',data:recallData};blmxManager.addEntry(recallEntry);const indexInQueue=userMessageQueue.findIndex(e=>e.id===id);if(indexInQueue>-1){userMessageQueue.splice(indexInQueue,1)}
blmxManager.persistLogToStorage();renderChatHistory(currentConversationId)}}})}
if(type==='music_share'){bubble.style.cursor='pointer';bubble.addEventListener('click',async()=>{const musicData=entry.data||(typeof entry.content==='object'?entry.content:JSON.parse(entry.content));if(from==='me'){navigateTo('listenTogether');currentSong={title:musicData.title||'未知歌曲',artist:musicData.artist||'未知歌手',src:musicData.src||'',lrc:musicData.lrc||''};localStorage.setItem(`blmx_current_song_${currentCharId}`,JSON.stringify(currentSong));document.getElementById('lt-song-title').textContent=currentSong.title;document.getElementById('lt-artist-name').textContent=currentSong.artist;if(currentSong.src){globalAudio.pause();globalAudio.src=currentSong.src;parseLyrics(currentSong.lrc);renderLyrics();try{await globalAudio.play();document.getElementById('lt-play-pause-btn').className='fas fa-pause-circle';document.getElementById('lt-vinyl-container').classList.add('playing');document.getElementById('lt-vinyl-view').classList.add('playing')}catch(e){console.error(e)}}}else{navigateTo('listenTogether');setTimeout(async()=>{await showDialog({mode:'alert',text:`TA邀请你一起听：\n《${musicData.title}》\n\nAI无法提供真实音源，请在接下来的弹窗中补充 MP3 链接。`});const result=await showMultiInputDialog({title:'完善歌曲信息',fields:[{id:'title',label:'歌名',type:'text',defaultValue:musicData.title},{id:'artist',label:'歌手',type:'text',defaultValue:musicData.artist},{id:'src',label:'MP3 直链 URL',type:'text',defaultValue:''},{id:'lrc',label:'LRC 歌词文本',type:'textarea',defaultValue:''}]});if(result&&result.src.trim()){currentSong={title:result.title.trim(),artist:result.artist.trim(),src:result.src.trim(),lrc:result.lrc||''};localStorage.setItem(`blmx_current_song_${currentCharId}`,JSON.stringify(currentSong));document.getElementById('lt-song-title').textContent=currentSong.title;document.getElementById('lt-artist-name').textContent=currentSong.artist;globalAudio.pause();globalAudio.src=currentSong.src;parseLyrics(currentSong.lrc);renderLyrics();await showDialog({mode:'alert',text:'歌曲已加载，开始播放！'});try{await globalAudio.play();document.getElementById('lt-play-pause-btn').className='fas fa-pause-circle';document.getElementById('lt-vinyl-container').classList.add('playing');document.getElementById('lt-vinyl-view').classList.add('playing')}catch(e){}}},300)}})}
if(type==='product_share'){const card=bubble.querySelector('.product-share-card');card.addEventListener('click',()=>{const pData=JSON.parse(card.dataset.product);navigateTo('productDetail');renderProductDetail(pData)})}
wechatBody.appendChild(messageRow);wechatBody.scrollTop=wechatBody.scrollHeight}
function addRecallNotice(entry,elementToReplace,index){const who=getDisplayName(entry.data.author,entry.conversationId);const noticeRow=document.createElement('div');noticeRow.className='timestamp-row';if(index!==undefined)noticeRow.dataset.logIndex=index;const recalledText=entry.data.target_text||'(内容未知)';noticeRow.innerHTML=`
            <div class="recall-notice-container">
                <div class="recall-notice-text">"${who}" 撤回了一条消息</div>
                <div class="recall-content">${recalledText}</div>
            </div>
        `;const noticeTextEl=noticeRow.querySelector('.recall-notice-text');const contentEl=noticeRow.querySelector('.recall-content');noticeTextEl.addEventListener('click',()=>{contentEl.classList.toggle('expanded')});if(elementToReplace){elementToReplace.replaceWith(noticeRow)}else{wechatBody.appendChild(noticeRow)}}
function renderChatHistory(conversationId){wechatBody.innerHTML='';if(!blmxManager)return;let entriesToRender=blmxManager.logEntries.map((entry,index)=>({...entry,originalIndex:index})).filter(entry=>{const convoId=entry.convoId||entry.conversationId||(entry.content&&entry.content.convoId)||(entry.data&&entry.data.convoId);return convoId===conversationId});const queuedEntries=userMessageQueue.filter(entry=>entry.conversationId===conversationId).map((entry,index)=>({...entry,originalIndex:blmxManager.logEntries.length+index,timestamp:new Date().toISOString()}));const allEntries=[...entriesToRender,...queuedEntries];allEntries.sort((a,b)=>{if(a.originalIndex!==undefined&&b.originalIndex!==undefined){return a.originalIndex-b.originalIndex}
const getTs=(e)=>{if(e.timestamp)return new Date(e.timestamp);if(e.data&&e.data.timestamp)return new Date(e.data.timestamp);if(e.content&&e.content.timestamp)return new Date(e.content.timestamp);return null};const dateA=getTs(a);const dateB=getTs(b);if(dateA&&dateB){return dateA-dateB}
return 0});allEntries.forEach(entry=>{if(entry.key!=='RECALL_MESSAGE'){addEntryToUI(entry,entry.originalIndex)}});const recallCommands=blmxManager.logEntries.filter(entry=>entry.key==='RECALL_MESSAGE');recallCommands.forEach(recallCmd=>{const targetText=recallCmd.data.target_text;const author=recallCmd.data.author;const messageRows=Array.from(wechatBody.querySelectorAll('.message-row'));const rowToRecall=messageRows.find(row=>{const bubble=row.querySelector('.message-bubble');if(!bubble)return!1;const rowAuthorId=row.querySelector('.message-avatar').dataset.senderId;return rowAuthorId===author&&bubble.textContent.trim()===targetText});if(rowToRecall){addRecallNotice(recallCmd,rowToRecall,recallCmd.originalIndex)}});wechatBody.scrollTop=wechatBody.scrollHeight}
function addEventLogToWeChat(eventData,index){const timeText=formatMomentTimestamp(eventData.timestamp);const row=document.createElement('div');row.className='event-log-row';if(index!==undefined)row.dataset.logIndex=index;const hasCallSummary=eventData.callSummary&&eventData.callSummary.trim()!=='';let eventHtml=`
        <div class="event-log-container">
            <div class="event-time-text">${timeText}</div>
    `;if(hasCallSummary){eventHtml+=`<div class="event-description">${eventData.callSummary.replace(/\n/g, '<br>')}</div>`}else if(eventData.description){eventHtml+=`<div class="event-description">${eventData.description}</div>`}
eventHtml+=`</div>`;row.innerHTML=eventHtml;const hasDescription=hasCallSummary||(eventData.description&&eventData.description.trim()!=='');if(hasDescription){const timeEl=row.querySelector('.event-time-text');const descEl=row.querySelector('.event-description');if(hasCallSummary){timeEl.textContent=eventData.description+' (点击查看摘要)'}else{timeEl.textContent=timeText}
timeEl.classList.add('has-desc');timeEl.addEventListener('click',()=>{descEl.classList.toggle('expanded')})}
wechatBody.appendChild(row)}
function getGroupEventDescription(eventData){let text='';const actorName=getDisplayName(eventData.author,eventData.convoId);switch(eventData.type){case 'create':text=`"${actorName}"创建了群聊`;break;case 'add':const addedNames=eventData.targetIds.map(id=>`"${getDisplayName(id, eventData.convoId)}"`).join('、');text=`"${actorName}"邀请了${addedNames}加入了群聊`;break;case 'remove':case 'kick':text=`"${getDisplayName(eventData.targetId, eventData.convoId)}"已被"${actorName}"移出群聊`;break;case 'leave':text=`"${actorName}"退出了群聊`;break;case 'rename':case 'rename_group':text=`"${actorName}"修改群名为“${eventData.newName}”`;break;case 'mute':text=`"${getDisplayName(eventData.targetId, eventData.convoId)}"被"${actorName}"禁言${eventData.duration}分钟`;break;case 'unmute':text=`"${getDisplayName(eventData.targetId, eventData.convoId)}"已被"${actorName}"解除禁言`;break;case 'unmute_auto':text=`"${getDisplayName(eventData.targetId, eventData.convoId)}"的禁言已到期，自动解除`;break;case 'set_admin':text=`"${actorName}"已将"${getDisplayName(eventData.targetId, eventData.convoId)}"设为管理员`;break;case 'unset_admin':text=`"${getDisplayName(eventData.targetId, eventData.convoId)}"的管理员已被"${actorName}"取消`;break;case 'nickname_change':const targetCurrentName=eventData.oldName||getDisplayName(eventData.targetId,eventData.convoId);const actorCurrentName=getDisplayName(eventData.author,eventData.convoId);if(eventData.targetId===eventData.author){text=`"${actorCurrentName}"将自己的群昵称修改为“${eventData.newName}”`}else{text=`"${actorCurrentName}"将群内“${targetCurrentName}”的昵称修改为“${eventData.newName}”`}
break;case 'dissolve':text=`群聊已被"${actorName}"解散`;break;case 'red_packet_grab':text=`${eventData.grabberName}领取了${actorName}的红包`;if(eventData.amount)text+=`，抢了${eventData.amount.toFixed(2)}元`;if(eventData.isLuckiest)text+=`，是运气王`;break}
return text}
function addGroupEventToWeChat(eventData,index){const text=getGroupEventDescription(eventData);if(!text)return;const row=document.createElement('div');row.className='system-event-row';if(index!==undefined)row.dataset.logIndex=index;row.innerHTML=`<span class="system-event-text">${text}</span>`;wechatBody.appendChild(row)}
function formatDiaryTimestamp(timestamp){if(!timestamp)return'';const date=new Date(timestamp.replace(' ','T'));if(isNaN(date))return'';const year=date.getFullYear();const month=(date.getMonth()+1).toString().padStart(2,'0');const day=date.getDate().toString().padStart(2,'0');return `${year}年${month}月${day}日`}
function formatMomentTimestamp(timestamp){if(!timestamp)return' ';const normalizedTimestamp=timestamp.replace(' ','T');const postDateTime=new Date(normalizedTimestamp);if(isNaN(postDateTime))return' ';const now=new Date(window.currentGameDate);const todayStart=new Date(now.getFullYear(),now.getMonth(),now.getDate());const yesterdayStart=new Date(todayStart);yesterdayStart.setDate(todayStart.getDate()-1);const hours=postDateTime.getHours().toString().padStart(2,'0');const minutes=postDateTime.getMinutes().toString().padStart(2,'0');const timeString=`${hours}:${minutes}`;if(postDateTime>=todayStart){return timeString}else if(postDateTime>=yesterdayStart){return `昨天 ${timeString}`}else if(postDateTime.getFullYear()===now.getFullYear()){return `${postDateTime.getMonth() + 1}月${postDateTime.getDate()}日`}else{return `${postDateTime.getFullYear()}年${postDateTime.getMonth() + 1}月${postDateTime.getDate()}日`}}
function updateConversationTimestamp(convoId,newTimestampStr){const convo=conversations.find(c=>c.id===convoId);if(!convo||!newTimestampStr){return}
const newTimestampMs=new Date(newTimestampStr.replace(' ','T')).getTime();if(isNaN(newTimestampMs)){return}
if(newTimestampMs>(convo.lastActivity||0)){convo.lastActivity=newTimestampMs;console.log(`[Time Sync] Conversation ${convoId} updated to ${new Date(newTimestampMs).toLocaleString()}`)}}
function renderMomentsFeed(authorIdToShow){if(!blmxManager)return;const showAll=!authorIdToShow;const authorIsUser=authorIdToShow==='user';const author=authorIsUser?userProfile:contacts.find(c=>c.id===authorIdToShow);const headerAuthor=showAll?userProfile:author;if(!headerAuthor){console.error("Cannot render moments for unknown author:",authorIdToShow);return}
document.getElementById('moments-cover-photo').src=headerAuthor.cover||'https://files.catbox.moe/bialj8.jpeg';document.getElementById('moments-user-avatar').src=getAvatar(headerAuthor.id);document.getElementById('moments-user-name').textContent=getDisplayName(headerAuthor.id,null);document.getElementById('user-signature-display').textContent=headerAuthor.signature||'';document.getElementById('post-moment-btn').style.display=(showAll||authorIsUser)?'block':'none';const coverPhotoEl=document.getElementById('moments-cover-photo');coverPhotoEl.onclick=async()=>{const currentAuthorForCover=showAll?userProfile:author;const newCover=await showDialog({mode:'prompt',text:`为 ${getDisplayName(currentAuthorForCover.id, null)} 输入新的朋友圈封面URL:`,defaultValue:currentAuthorForCover.cover||''});if(newCover!==null){currentAuthorForCover.cover=newCover;coverPhotoEl.src=newCover;saveData()}};momentsFeedList.innerHTML='';let allMomentPosts=blmxManager.logEntries.filter(e=>e.key==='MOMENT'&&e.data&&e.data.momentId);const postsToRender={};allMomentPosts.forEach(post=>{if(!authorIdToShow||post.data.author===authorIdToShow){postsToRender[post.data.momentId]={...post,likes:[],comments:[]}}});blmxManager.logEntries.forEach(interactionEntry=>{if(interactionEntry.key==='CHAR_LIKE'||interactionEntry.key==='CHAR_COMMENT'){const targetMomentId=interactionEntry.data.target_post_id;if(targetMomentId&&postsToRender[targetMomentId]){if(interactionEntry.key==='CHAR_LIKE'){const likerName=getDisplayName(interactionEntry.data.author,null);if(!postsToRender[targetMomentId].likes.some(l=>l.name===likerName)){postsToRender[targetMomentId].likes.push({name:likerName,authorId:interactionEntry.data.author})}}else{postsToRender[targetMomentId].comments.push({...interactionEntry})}}}});Object.values(postsToRender).reverse().forEach(post=>{const{data}=post;const authorId=data.author;const authorName=getDisplayName(authorId,null);const authorAvatar=getAvatar(authorId);const fromUser=(authorId==='user'||authorId==='{{user}}');let isVisibleToUser=!0;if(data.invisibleTo&&(data.invisibleTo.includes('user')||data.invisibleTo.includes('{{user}}'))){isVisibleToUser=!1}else if(data.visibleTo&&data.visibleTo.length>0&&!(data.visibleTo.includes('user')||data.visibleTo.includes('{{user}}'))){isVisibleToUser=!1}
if(data.visibleTo&&data.visibleTo.includes('user')){isVisibleToUser=!0}
const li=document.createElement('li');li.className='moment-post';li.dataset.momentId=data.momentId;li.dataset.authorId=authorId;let mediaHtml='';if(data.image_type==='url'&&data.image){mediaHtml=`<div class="post-media-container"><img src="${data.image}" class="post-media-image"></div>`}else if(data.image_type==='desc'&&data.image){const naiHtml=getNaiContentHtml(data.momentId,data.image);if(naiHtml){mediaHtml=`<div class="post-media-container">${naiHtml}</div>`}else{mediaHtml=`<div class="post-media-container"><div class="image-desc-content">${data.image}</div></div>`}}
let interactionsHtml='';if(post.comments.length>0){const commentsHtml='<ul class="comments-section">'+post.comments.map(c=>{const commentAuthorName=getDisplayName(c.data.author,null);const commentText=c.data.text;const quoteRegex=/^\[引用:"(.*?):\s*(.*?)"\]\s*(.*)$/s;const quoteMatch=commentText.match(quoteRegex);const atReplyRegex=/^@([^:]+):\s*(.*)$/s;const atMatch=commentText.match(atReplyRegex);if(quoteMatch){const quotedAuthor=quoteMatch[1];const quotedContent=quoteMatch[2];const replyText=quoteMatch[3];return'<li>'+'<span class="comment-author">'+commentAuthorName+'</span>: '+'<div class="moment-quote-block">'+'<div class="quote-author">@'+quotedAuthor+'</div>'+'<div class="quote-content">'+quotedContent.replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</div>'+'</div>'+'<span class="reply-text">'+replyText.replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</span>'+'</li>'}else if(atMatch){const repliedToName=atMatch[1];const replyText=atMatch[2];return'<li>'+'<span class="comment-author">'+commentAuthorName+'</span>'+' 回复 '+'<span class="comment-author">'+repliedToName.replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</span>: '+'<span class="reply-text">'+replyText.replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</span>'+'</li>'}else{return'<li><span class="comment-author">'+commentAuthorName+'</span>: '+commentText.replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</li>'}}).join('')+'</ul>';interactionsHtml=`<div class="post-interactions">${commentsHtml}</div>`}
let privacyIconHtml='';if(!isVisibleToUser){privacyIconHtml=`<span class="privacy-indicator" title="对你不可见"><i class="fas fa-eye-slash"></i></span>`}else if(data.isPrivate){privacyIconHtml=`<span class="privacy-indicator" title="私密，仅自己可见"><i class="fas fa-lock"></i></span>`}else if((data.visibleTo&&data.visibleTo.length>0)||(data.invisibleTo&&data.invisibleTo.length>0)){const visibleText=(data.visibleTo&&data.visibleTo.length>0)?`部分可见: ${data.visibleTo.map(id => getDisplayName(id, null)).join(', ')}`:'';const invisibleText=(data.invisibleTo&&data.invisibleTo.length>0)?`不给谁看: ${data.invisibleTo.map(id => getDisplayName(id, null)).join(', ')}`:'';privacyIconHtml=`<span class="privacy-indicator" title="${visibleText}\n${invisibleText}"><i class="fas fa-user-friends"></i></span>`}
const displayTime=formatMomentTimestamp(data.timestamp);const deleteBtnHtml=`<i class="fas fa-trash-alt delete-moment-btn" title="删除"></i>`;const isLikedByUser=post.likes.some(l=>l.authorId==='user'||l.authorId==='{{user}}');const heartIconClass=isLikedByUser?'fas fa-heart liked':'far fa-heart';const authorNameClass=`post-author-name ${!fromUser ? 'is-character' : ''}`;const disabledClass=!isVisibleToUser?'disabled':'';li.innerHTML=`
			<img src="${authorAvatar}" alt="Avatar" class="post-author-avatar">
			<div class="post-details">
				<div class="post-header">
					<span class="${authorNameClass}">${authorName}</span>
					<div class="post-actions-top ${disabledClass}">
						<i class="fas fa-share-alt" title="转发" data-action="forward"></i>
						<i class="${heartIconClass}" title="点赞" data-action="like"></i>
					</div>
				</div>
				<p class="post-content">${data.text || ''}</p>
				<div class="post-media">${mediaHtml}</div>
				<div class="post-meta">
					<span class="timestamp">${displayTime}</span>
					<div class="post-meta-right">
						${privacyIconHtml}
						${deleteBtnHtml}
						<button class="moment-reply-btn ${disabledClass}" data-action="reply">回复</button>
					</div>
				</div>
				${interactionsHtml}
			</div>
		`;momentsFeedList.appendChild(li)})}
function renderWeiboFeed(category){const container=document.getElementById('weibo-feed-list-container');const feedTitleEl=document.getElementById('weibo-feed-title');container.innerHTML='';const allZones=getWeiboZones();const currentZoneData=allZones.find(z=>z.id===category);if(currentZoneData){feedTitleEl.classList.remove(...Array.from(feedTitleEl.classList).filter(c=>c.startsWith('title-bg-')));feedTitleEl.style.setProperty('--title-bg-color',currentZoneData.color)}
const allPostsForCategory=weiboData.posts.filter(p=>p.category===category);if(allPostsForCategory.length===0){container.innerHTML='<p style="text-align:center; color:#999; margin-top:2rem;">这个分区还没有内容哦。</p>';return}
const pinnedPosts=allPostsForCategory.filter(p=>p.isPinned);const remainingPosts=allPostsForCategory.filter(p=>!p.isPinned);remainingPosts.sort((a,b)=>(b.hotness||0)-(a.hotness||0));const hotPosts=remainingPosts.slice(0,2);const hotPostIds=new Set(hotPosts.map(p=>p.postId));const normalPosts=remainingPosts.filter(p=>!hotPostIds.has(p.postId)).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));const createThreadCardElement=(post,tagType='')=>{const cardEl=document.createElement('div');cardEl.className='forum-thread-item-card';cardEl.dataset.postId=post.postId;cardEl.dataset.category=category;let tagHtml='';if(tagType==='pinned'){tagHtml='<span class="thread-tag thread-tag-pinned">置顶</span>'}else if(tagType==='hot'){tagHtml='<span class="thread-tag thread-tag-hot">热门</span>'}
let prefixTagHtml='';let displayTitle=post.title||'无标题帖子';const prefixRegex=/^(?:\[|【)([^\]】]+)(?:\]|】)\s*(.*)$/;const titleMatch=displayTitle.match(prefixRegex);if(titleMatch){const prefixText=titleMatch[1];displayTitle=titleMatch[2];prefixTagHtml=`<span class="thread-tag thread-tag-type">${prefixText}</span>`}
const authorIsKnown=contacts.some(c=>c.id===post.author)||post.author==='user'||post.author==='{{user}}';const authorAvatar=authorIsKnown?getAvatar(post.author):generatePasserbyProfile(post.author).avatar;const authorName=authorIsKnown?getDisplayName(post.author,null):post.author;const readStarClass=post.isRead?'thread-read-star read':'thread-read-star';const readStarTitle=post.isRead?'已读':'未读';cardEl.innerHTML=`
<div class="thread-top-row">
	<span class="thread-hotness">${post.hotness || 0}</span>
	${tagHtml}
	${prefixTagHtml}
	<span class="thread-title">${displayTitle}</span>
</div>
<div class="thread-bottom-row">
	<img src="${authorAvatar}" class="thread-author-avatar">
	<span class="thread-author-name">${authorName}</span>
	<span class="thread-timestamp">${formatMomentTimestamp(post.timestamp)}</span>
	<div class="thread-actions">
		<i class="fas fa-star ${readStarClass}" title="${readStarTitle}"></i>
		<i class="fas fa-trash-alt thread-delete-btn" title="删除帖子"></i>
	</div>
</div>
`;return cardEl};pinnedPosts.forEach(post=>container.appendChild(createThreadCardElement(post,'pinned')));hotPosts.forEach(post=>container.appendChild(createThreadCardElement(post,'hot')));normalPosts.forEach(post=>container.appendChild(createThreadCardElement(post,'')))}
function appendNewCommentToForum(commentData){const detailView=document.getElementById('weibo-detail-view');const container=detailView.querySelector('.weibo-detail-body');const postId=commentData.postId||commentData.target_post_id;const post=weiboData.posts.find(p=>p.postId===postId);if(!post)return;const opAuthorId=post.author;const isBotReply=commentData.author.endsWith('BOT');if(isBotReply){const botReplyCard=document.createElement('div');botReplyCard.className='forum-bot-reply';botReplyCard.innerHTML=`
						<i class="fas fa-robot bot-icon"></i>
						<div class="bot-content-wrapper">
							<div class="bot-author-name">${commentData.author}</div>
							<div class="bot-text">${commentData.text || commentData.content}</div>
						</div>
					`;container.appendChild(botReplyCard);return}
const currentTopLevelCount=container.querySelectorAll('.forum-post-card:not(.is-image-attachment)').length;const level=currentTopLevelCount+1;const createForumCard=(data,level,isOp=!1,isImageAttachment=!1)=>{const processMentions=(text)=>{let safeText=text.replace(/</g,"&lt;").replace(/>/g,"&gt;");safeText=safeText.replace(/@([^\s@#]+)/g,(match,username)=>{return `<span class="mention" data-username="${username}">${match}</span>`});return safeText};const authorId=data.author;let profile;if(authorId==='user'||authorId==='{{user}}'||authorId===userProfile.name){const postCount=233;const titleInfo=getForumTitleByPostCount(postCount);profile={...userProfile,id:'user',name:userProfile.name,avatar:getAvatar('user'),postCount,title:titleInfo.text,titleColor:titleInfo.color}}else{const knownContact=contacts.find(c=>c.id===authorId||c.name===authorId);if(knownContact){const postCount=Math.floor(Math.random()*701)+300;const titleInfo=getForumTitleByPostCount(postCount);profile={...knownContact,name:getDisplayName(knownContact.id),avatar:getAvatar(knownContact.id),postCount,title:titleInfo.text,titleColor:titleInfo.color}}else{profile=generatePasserbyProfile(authorId)}}
if(data.likes===undefined){data.likes=Math.floor(Math.random()*10)}
const identity=getAnonymousIdentity();if(identity&&authorId===identity.name){profile=generatePasserbyProfile(authorId)}else if(authorId===userProfile.id||authorId==='{{user}}'){const postCount=233;const titleInfo=getForumTitleByPostCount(postCount);profile={...userProfile,name:getDisplayName('user'),avatar:getAvatar('user'),postCount,title:titleInfo.text,titleColor:titleInfo.color}}else{const knownContact=contacts.find(c=>c.id===authorId);if(knownContact){const postCount=Math.floor(Math.random()*701)+300;const titleInfo=getForumTitleByPostCount(postCount);profile={...knownContact,name:getDisplayName(knownContact.id),avatar:getAvatar(knownContact.id),postCount,title:titleInfo.text,titleColor:titleInfo.color}}else{profile=generatePasserbyProfile(authorId)}}
let bodyHtml='';const fullText=(data.text||data.content||'');if(data.replyTo){const originalComment=(weiboData.comments[postId]||[]).find(c=>c.commentId===data.replyTo);let quoteBlockHtml;if(originalComment){const quoteAuthor=getDisplayName(originalComment.author,null);const quoteContent=originalComment.text;quoteBlockHtml=`<div class="forum-quote-block"><div class="quote-author">@${quoteAuthor}</div><div class="quote-content">${quoteContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div></div>`}else{quoteBlockHtml=`<div class="forum-quote-block"><div class="quote-content">[原消息已删除]</div></div>`}
const replyTextHtml=processMentions(fullText);bodyHtml=quoteBlockHtml+replyTextHtml}else{const quoteRegex=/\[引用:"(.*?):\s*([\s\S]*?)"\]([\s\S]*)/;const quoteMatch=fullText.match(quoteRegex);if(quoteMatch){const quoteAuthor=quoteMatch[1].trim();const quoteContent=quoteMatch[2].trim();const replyText=quoteMatch[3].trim();const quoteBlockHtml=`<div class="forum-quote-block"><div class="quote-author">${processMentions('@' + quoteAuthor)}</div><div class="quote-content">${quoteContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div></div>`;const replyTextHtml=processMentions(replyText);bodyHtml=quoteBlockHtml+replyTextHtml}else{bodyHtml=processMentions(fullText)}}
let imageHtml='';if(data.image&&data.image_type){const imgStyle="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-top: 0.8rem; display: block;";if(data.image_type==='url'){imageHtml=`<img src="${data.image}" class="post-media-image" style="${imgStyle}">`}else if(data.image_type==='desc'){const naiHtml=getNaiContentHtml(data.commentId,data.image);if(naiHtml){imageHtml=`<div style="${imgStyle} overflow: hidden; position: relative;">${naiHtml}</div>`}else{imageHtml=`<div class="forum-image-description">${data.image.replace(/</g, "&lt;" ).replace( />/g, "&gt;")}</div>`}}}
const card=document.createElement('div');card.className=isImageAttachment?'forum-post-card is-image-attachment':'forum-post-card';card.dataset.commentId=data.commentId;card.dataset.authorName=profile.name;const unreadIndicatorHtml=(data.isRead===!1)?'<div class="unread-indicator"></div>':'';const titleHtml=`<div class="forum-user-title" style="border-color: ${profile.titleColor}; color: ${profile.titleColor};"><i class="fas fa-certificate icon" style="color: ${profile.titleColor};"></i><span>${profile.title}</span></div>`;let userPanelHtml,contentPanelHtml;if(isImageAttachment){userPanelHtml=`<div class="forum-user-panel" style="justify-content: flex-start; align-items: flex-start;"><img src="${profile.avatar}" alt="${profile.name}" class="forum-user-avatar" style="width: 2rem; height: 2rem; margin-bottom: 0;"><i class="fas fa-level-up-alt" style="transform: rotate(90deg); margin-top: 0.5rem; color: var(--forum-divider-color);"></i></div>`;contentPanelHtml=`<div class="forum-content-panel"><div class="forum-post-body">${imageHtml}</div></div>`}else{let authorDisplayHtml;if(data.author===opAuthorId){authorDisplayHtml='<span class="level-tag">楼主</span>'}else{authorDisplayHtml=`<div class="forum-user-name">${profile.name}</div>`}
userPanelHtml=`
							<div class="forum-user-panel">
								<img src="${profile.avatar}" alt="${profile.name}" class="forum-user-avatar">
								${authorDisplayHtml}
								${titleHtml}
								<div class="forum-user-meta"><div>发帖 | ${profile.postCount}</div></div>
							</div>`;contentPanelHtml=`
							<div class="forum-content-panel">
								<div class="forum-post-header">
									<div class="forum-post-level"><span class="level-number">#${level}</span></div>
									<span class="forum-post-timestamp">${formatMomentTimestamp(data.timestamp)}</span>
								</div>
								<div class="forum-post-body">${bodyHtml}</div>
								<div class="forum-post-footer" style="justify-content: flex-end; gap: 1rem;">
									<div class="weibo-comment-actions" data-action="delete" data-comment-id="${data.commentId}" title="删除"><i class="far fa-trash-alt"></i> <span>删除</span></div>
									<div class="weibo-comment-actions" data-action="reply" data-comment-id="${data.commentId}" data-author-name="${profile.name}" title="回复"><i class="far fa-comment-alt"></i> <span>回复</span></div>
									<div class="weibo-comment-actions"><i class="far fa-thumbs-up"></i> <span>${data.likes || 0}</span></div>
								</div>
							</div>`}
card.innerHTML=userPanelHtml+contentPanelHtml+unreadIndicatorHtml;return card};const hasText=commentData.text&&commentData.text.trim()!=='';const hasImage=commentData.image&&commentData.image.trim()!==''&&commentData.image_type!=='none';if(hasText&&hasImage){const textData={...commentData,image:null,image_type:'none'};const textCard=createForumCard(textData,level,!1,!1);container.appendChild(textCard);const imageData={...commentData,text:'',content:''};const imageCard=createForumCard(imageData,0,!1,!0);container.appendChild(imageCard)}else{const card=createForumCard(commentData,level);container.appendChild(card)}}
async function renderForumProfile(contactId){const view=document.getElementById('forum-profile-view');const avatarEl=view.querySelector('.profile-avatar');const nameEl=view.querySelector('.profile-name');const tagEl=view.querySelector('.profile-post-tag');const signatureEl=view.querySelector('.profile-signature');const postsTab=document.getElementById('profile-tab-posts');const amaTab=document.getElementById('profile-tab-ama');const footprintsTab=document.getElementById('profile-tab-footprints');const profileData=(contactId==='user'||contactId==='{{user}}')?userProfile:contacts.find(c=>c.id===contactId);if(!profileData){console.error(`[Forum Profile] Render failed: Cannot find contact with ID: ${contactId}`);nameEl.textContent='用户不存在';return}
const isOwnProfile=(profileData.id==='user'||profileData.id==='{{user}}');avatarEl.src=getAvatar(profileData.id);nameEl.textContent=getDisplayName(profileData.id,null);signatureEl.textContent=profileData.signature||'这个人很懒，什么都没留下。';const postCount=weiboData.posts.filter(p=>p.author===profileData.id||(isOwnProfile&&p.author==='{{user}}')).length;tagEl.textContent=`${postCount} 篇帖子`;postsTab.innerHTML='';const userPosts=weiboData.posts.filter(p=>p.author===profileData.id||(isOwnProfile&&p.author==='{{user}}')).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));if(userPosts.length>0){userPosts.forEach(post=>{const postCard=document.createElement('div');postCard.className='post-card';postCard.dataset.postId=post.postId;let finalTitleHtml='';const originalTitle=post.title||'无标题帖子';const prefixRegex=/^(?:\[|【)([^\]】]+)(?:\]|】)\s*(.*)$/;const titleMatch=originalTitle.match(prefixRegex);if(titleMatch){const prefixText=titleMatch[1];const titleText=titleMatch[2];finalTitleHtml=`
                    <span class="profile-post-prefix-tag">${prefixText}</span>
                    <span class="profile-post-title-text">${titleText}</span>
                `}else{finalTitleHtml=`<span class="profile-post-title-text">${originalTitle}</span>`}
const postText=(post.text||post.content||'');const hashtagRegex=/#([^#\s]+)/g;const hashtags=[...new Set([...postText.matchAll(hashtagRegex)].map(match=>match[1]))];const hashtagsHtml=hashtags.length>0?`<div class="profile-post-hashtags">
                    ${hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join('')}
                </div>`:'';const cleanText=postText.replace(hashtagRegex,'').trim();const excerptText=(cleanText||'(无正文内容)').substring(0,100)+(cleanText.length>100?'...':'');postCard.innerHTML=`
                <h3 class="title">${finalTitleHtml}</h3>
                <div class="profile-post-content">
                    <p class="excerpt">${excerptText}</p>
                </div>
                ${hashtagsHtml} 
                <div class="post-card-footer">
                    <span class="timestamp">${formatMomentTimestamp(post.timestamp)}</span>
                    <div class="post-card-stats" style="display: flex; gap: 0.8rem;">
                        <span><i class="fas fa-share"></i> ${post.retweets || 0}</span>
                        <span><i class="far fa-comment-alt"></i> ${(weiboData.comments[post.postId] || []).length}</span>
                        <span><i class="far fa-thumbs-up"></i> ${post.likes || 0}</span>
                    </div>
                </div>
            `;postsTab.appendChild(postCard)})}else{postsTab.innerHTML='<p style="text-align:center; color: var(--forum-text-secondary); padding: 2rem;">TA还没有发布过任何帖子。</p>'}
const isViewingOwnProfile=(profileData.id==='user'||profileData.id==='{{user}}');amaTab.innerHTML='';if(!isViewingOwnProfile){const inputBox=document.createElement('div');inputBox.className='ama-input-box';inputBox.innerHTML=`
            <div class="ama-input-header">匿名向TA提问</div>
            <div class="ama-input-body">
                <textarea rows="2" placeholder="输入你的问题..."></textarea>
            </div>
            <div class="ama-input-footer">
                <span id="view-more-ama-btn">🔍 查看更多</span>
                <button><i class="fas fa-paper-plane"></i></button>
            </div>
        `;amaTab.appendChild(inputBox)}else{const placeholder=document.createElement('p');placeholder.style.cssText='text-align:center; color: var(--forum-text-secondary); padding: 2rem;';placeholder.textContent='这里是你的匿名提问箱。';amaTab.appendChild(placeholder)}
const qnaListContainer=document.createElement('div');qnaListContainer.className='ama-qna-list';amaTab.appendChild(qnaListContainer);if(blmxManager){const savedAmaPairs=blmxManager.logEntries.filter(entry=>entry.key==='AMA_PAIR'&&(entry.data.author===contactId||(isOwnProfile&&entry.data.author==='{{user}}'))).sort((a,b)=>new Date(b.data.timestamp)-new Date(a.data.timestamp));if(isViewingOwnProfile&&savedAmaPairs.length>0){const placeholder=amaTab.querySelector('p');if(placeholder)placeholder.style.display='none'}
savedAmaPairs.forEach(entry=>{const qnaData=entry.data;const qnaCard=document.createElement('div');qnaCard.className='qna-card';qnaCard.innerHTML=`
                <div class="question"><p>${qnaData.question.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p></div>
                <div class="answer">
                    <div class="answer-content">
                        <p class="author">${getDisplayName(qnaData.author, null)}</p>
                        <p>${qnaData.answer.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            `;qnaListContainer.appendChild(qnaCard)})}
footprintsTab.innerHTML='';const userComments=[];for(const postId in weiboData.comments){weiboData.comments[postId].forEach(comment=>{if(comment.author===profileData.id||(isOwnProfile&&comment.author==='{{user}}')){userComments.push({...comment,post:weiboData.posts.find(p=>p.postId===postId)})}})}
userComments.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));if(userComments.length>0){userComments.forEach(comment=>{if(!comment.post)return;const quoteRegex=/\[引用:"(?:.*?):\s*(?:[\s\S]*?)"\]([\s\S]*)/;let displayText=comment.text;const quoteMatch=displayText.match(quoteRegex);if(quoteMatch&&quoteMatch[1]){displayText=quoteMatch[1].trim()}
const footprintItem=document.createElement('div');footprintItem.className='footprint-item';footprintItem.innerHTML=`
                <div class="icon"><i class="far fa-comment-alt"></i></div>
                <div class="content">
                    <p class="action">
                        在帖子
                        <span class="post-link" data-post-id="${comment.post.postId}">${comment.post.title}</span>
                        中发表了评论
                    </p>
                    <div class="quote">${displayText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
                </div>
            `;footprintsTab.appendChild(footprintItem)})}else{footprintsTab.innerHTML='<p style="text-align:center; color: var(--forum-text-secondary); padding: 2rem;">TA还没有发表过任何评论。</p>'}}
function renderWeiboDetail(postId){const post=weiboData.posts.find(p=>p.postId===postId);if(!post){return}
const detailView=document.getElementById('weibo-detail-view');const container=detailView.querySelector('.weibo-detail-body');const headerTitleEl=detailView.querySelector('.weibo-detail-title');container.innerHTML='';passerbyCache.clear();const usedPasserbyAvatars=new Set();headerTitleEl.textContent='';const opAuthorId=post.author;if(post.likes===undefined)post.likes=Math.floor(Math.random()*1000);if(post.retweets===undefined)post.retweets=Math.floor(Math.random()*51);if(post.bookmarks===undefined)post.bookmarks=Math.floor(Math.random()*21);const createForumCard=(data,level,isOp=!1,isImageAttachment=!1)=>{const processMentionsAndHashtags=(text)=>{let safeText=text.replace(/</g,"&lt;").replace(/>/g,"&gt;");safeText=safeText.replace(/@([^\s@#]+)/g,(match,username)=>{return `<span class="mention" data-username="${username}">${match}</span>`});return safeText};const authorId=data.author;let profile;if(data.likes===undefined){data.likes=Math.floor(Math.random()*10)}
if(authorId==='user'||authorId==='{{user}}'||authorId===userProfile.name){const postCount=233;const titleInfo=getForumTitleByPostCount(postCount);profile={...userProfile,id:'user',name:userProfile.name,avatar:getAvatar('user'),postCount,title:titleInfo.text,titleColor:titleInfo.color}}else{const knownContact=contacts.find(c=>c.id===authorId||c.name===authorId);if(knownContact){const postCount=Math.floor(Math.random()*701)+300;const titleInfo=getForumTitleByPostCount(postCount);profile={...knownContact,name:getDisplayName(knownContact.id),avatar:getAvatar(knownContact.id),postCount,title:titleInfo.text,titleColor:titleInfo.color}}else{profile=generatePasserbyProfile(authorId)}}
let bodyHtml='';const fullText=(data.text||data.content||'');if(data.replyTo){const originalComment=(weiboData.comments[postId]||[]).find(c=>c.commentId===data.replyTo);let quoteBlockHtml;if(originalComment){const quoteAuthor=getDisplayName(originalComment.author,null);const quoteContent=originalComment.text;quoteBlockHtml=`<div class="forum-quote-block"><div class="quote-author">@${quoteAuthor}</div><div class="quote-content">${quoteContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div></div>`}else{quoteBlockHtml=`<div class="forum-quote-block"><div class="quote-content">[原消息已删除]</div></div>`}
const replyTextHtml=processMentionsAndHashtags(fullText);bodyHtml=quoteBlockHtml+replyTextHtml}else{const quoteRegex=/\[引用:"(.*?):\s*([\s\S]*?)"\]([\s\S]*)/;const quoteMatch=fullText.match(quoteRegex);if(quoteMatch){const quoteAuthor=quoteMatch[1].trim();const quoteContent=quoteMatch[2].trim();const replyText=quoteMatch[3].trim();const quoteBlockHtml=`<div class="forum-quote-block"><div class="quote-author">${processMentionsAndHashtags('@' + quoteAuthor)}</div><div class="quote-content">${quoteContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div></div>`;const replyTextHtml=processMentionsAndHashtags(replyText);bodyHtml=quoteBlockHtml+replyTextHtml}else{bodyHtml=processMentionsAndHashtags(fullText)}}
let imageHtml='';if(data.image&&data.image_type){const imgStyle="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-top: 0.8rem; display: block;";if(data.image_type==='url'){imageHtml=`<img src="${data.image}" class="post-media-image" style="${imgStyle}">`}else if(data.image_type==='desc'){const naiHtml=getNaiContentHtml(data.commentId||data.postId,data.image);if(naiHtml){imageHtml=`<div style="${imgStyle} overflow: hidden; position: relative;">${naiHtml}</div>`}else{imageHtml=`<div class="forum-image-description">${data.image.replace(/</g, "&lt;" ).replace( />/g, "&gt;")}</div>`}}}
const card=document.createElement('div');card.className=isOp?'forum-post-card is-op':(isImageAttachment?'forum-post-card is-image-attachment':'forum-post-card');card.dataset.commentId=data.commentId||'post-op';card.dataset.authorName=profile.name;const unreadIndicatorHtml=(data.isRead===!1)?'<div class="unread-indicator"></div>':'';if(isOp){const userPanelHtml=`
				<div class="forum-user-panel">
					<img src="${profile.avatar}" alt="${profile.name}" class="forum-user-avatar">
					<div class="op-user-info-wrapper">
						<div class="forum-user-name">${profile.name}</div>
						<span class="level-tag">楼主</span>
					</div>
				</div>`;let displayTitle=data.title||'';const prefixRegex=/^\[([^\]]+)\]\s*(.*)$/;const titleMatch=displayTitle.match(prefixRegex);if(titleMatch){displayTitle=titleMatch[2]}
const titleAreaHtml=`
				<hr class="forum-title-divider">
				<div class="forum-post-title-area">
					<h1>${displayTitle}</h1>
				</div>
				<hr class="forum-title-divider">
			`;let hashtagsHtml='';const hashtagRegex=/#([^#\s]+)/g;const hashtags=[...(data.text||'').matchAll(hashtagRegex)].map(match=>match[1]);if(hashtags.length>0){const uniqueHashtags=[...new Set(hashtags)];hashtagsHtml=`
					<div class="forum-post-hashtags">
						${uniqueHashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join('')}
					</div>
				`;bodyHtml=bodyHtml.replace(hashtagRegex,'').trim()}
const commentCount=(weiboData.comments[postId]||[]).length;const contentPanelHtml=`
				<div class="forum-content-panel" style="margin-top:0;">
					<div class="forum-post-body">${bodyHtml}${imageHtml}</div>
					${hashtagsHtml}
					<div class="forum-post-footer">
						<span class="forum-post-timestamp" style="margin-right: auto;">${formatMomentTimestamp(data.timestamp)}</span>
						<div class="weibo-comment-actions-group">
							<div class="weibo-comment-actions"><i class="fas fa-share"></i><span>${data.retweets || 0}</span></div>
							<div class="weibo-comment-actions"><i class="far fa-comment-alt"></i><span>${commentCount}</span></div>
							<div class="weibo-comment-actions"><i class="far fa-thumbs-up"></i><span>${data.likes || 0}</span></div>
						</div>
					</div>
				</div>`;card.innerHTML=userPanelHtml+titleAreaHtml+contentPanelHtml}else{const isBotReply=data.author.endsWith('BOT');if(isBotReply){const botReplyCard=document.createElement('div');botReplyCard.className='forum-bot-reply';botReplyCard.innerHTML=`
						<i class="fas fa-robot bot-icon"></i>
						<div class="bot-content-wrapper">
							<div class="bot-author-name">${data.author}</div>
							<div class="bot-text">${data.text || data.content}</div>
						</div>
					`;return botReplyCard}else{if(data.likes===undefined){data.likes=Math.floor(Math.random()*10)}
let userPanelHtml_comment,contentPanelHtml_comment;const titleHtml=`<div class="forum-user-title" style="border-color: ${profile.titleColor}; color: ${profile.titleColor};"><i class="fas fa-certificate icon" style="color: ${profile.titleColor};"></i><span>${profile.title}</span></div>`;if(isImageAttachment){userPanelHtml_comment=`<div class="forum-user-panel" style="justify-content: flex-start; align-items: flex-start;"><img src="${profile.avatar}" alt="${profile.name}" class="forum-user-avatar" style="width: 2rem; height: 2rem; margin-bottom: 0;"><i class="fas fa-level-up-alt" style="transform: rotate(90deg); margin-top: 0.5rem; color: var(--forum-divider-color);"></i></div>`;contentPanelHtml_comment=`<div class="forum-content-panel"><div class="forum-post-body">${imageHtml}</div></div>`}else{let authorDisplayHtml;if(data.author===opAuthorId||(opAuthorId==='user'&&data.author==='{{user}}')||(opAuthorId==='{{user}}'&&data.author==='user')){authorDisplayHtml='<span class="level-tag">楼主</span>'}else{authorDisplayHtml=`<div class="forum-user-name">${profile.name}</div>`}
userPanelHtml_comment=`
						<div class="forum-user-panel">
							<img src="${profile.avatar}" alt="${profile.name}" class="forum-user-avatar">
							${authorDisplayHtml}
							${titleHtml}
							<div class="forum-user-meta"><div>发帖 | ${profile.postCount}</div></div>
						</div>`;contentPanelHtml_comment=`
						<div class="forum-content-panel">
							<div class="forum-post-header">
								<div class="forum-post-level"><span class="level-number">#${level}</span></div>
								<span class="forum-post-timestamp">${formatMomentTimestamp(data.timestamp)}</span>
							</div>
							<div class="forum-post-body">${bodyHtml}</div>
							<div class="forum-post-footer" style="justify-content: flex-end; gap: 1rem;">
								<div class="weibo-comment-actions" data-action="delete" data-comment-id="${data.commentId}" title="删除"><i class="far fa-trash-alt"></i> <span>删除</span></div>
								<div class="weibo-comment-actions" data-action="reply" data-comment-id="${data.commentId}" data-author-name="${profile.name}" title="回复"><i class="far fa-comment-alt"></i> <span>回复</span></div>
								<div class="weibo-comment-actions"><i class="far fa-thumbs-up"></i> <span>${data.likes || 0}</span></div>
							</div>
						</div>`}
card.innerHTML=userPanelHtml_comment+contentPanelHtml_comment+unreadIndicatorHtml}}
card.dataset.level=level;return card};const opCard=createForumCard(post,1,!0);container.appendChild(opCard);const commentsForPost=(weiboData.comments[postId]||[]).slice().sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));let levelCounter=2;commentsForPost.forEach(comment=>{const hasText=comment.text&&comment.text.trim()!=='';const hasImage=comment.image&&comment.image.trim()!==''&&comment.image_type!=='none';if(hasText&&hasImage){const textData={...comment,image:null,image_type:'none'};const textCard=createForumCard(textData,levelCounter,!1,!1);container.appendChild(textCard);levelCounter++;const imageData={...comment,text:'',content:''};const imageCard=createForumCard(imageData,0,!1,!0);container.appendChild(imageCard)}else{const card=createForumCard(comment,levelCounter);container.appendChild(card);levelCounter++}});detailView.dataset.postId=postId;detailView.dataset.currentPostId=postId;detailView.querySelector('.weibo-send-comment-btn').dataset.postId=postId}
async function handleDeletePost(e){const postId=e.target.dataset.postId;if(!postId)return;const postToDelete=weiboData.posts.find(p=>p.postId===postId);if(!postToDelete)return;const confirmed=await showDialog({mode:'confirm',text:'确定要删除这条帖子吗？此操作不可恢复。'});if(confirmed){blmxManager.logEntries=blmxManager.logEntries.filter(entry=>{if(entry.key==='WEIBO_POST'&&entry.data.postId===postId)return!1;if((entry.key==='WEIBO_COMMENT'||entry.key==='WEIBO_LIKE')&&(entry.data.postId===postId||entry.data.target_post_id===postId))return!1;return!0});updateWeiboDataFromLog();await blmxManager.persistLogToStorage();const categoryOfDeletedPost=postToDelete.category;const zoneCard=document.querySelector(`.weibo-zone-card[data-category="${categoryOfDeletedPost}"]`);const categoryName=zoneCard?zoneCard.querySelector('.zone-title').textContent:'帖子列表';renderWeiboFeed(categoryOfDeletedPost);navigateTo('weiboFeed',{category:categoryOfDeletedPost,categoryName:categoryName});await showDialog({mode:'alert',text:'帖子已删除。'})}}
function updateWeiboZoneIndicators(){const zoneCards=document.querySelectorAll('#weibo-view .weibo-zone-card');zoneCards.forEach(card=>{const category=card.dataset.category;const indicator=card.querySelector('.zone-status-indicator');if(!category||!indicator)return;const hasPosts=weiboData.posts.some(p=>p.category===category);if(hasPosts){indicator.classList.add('visible')}else{indicator.classList.remove('visible')}})}
function handleWeiboForward(e){const postId=e.currentTarget.dataset.postId;const post=weiboData.posts.find(p=>p.postId===postId);if(!post){console.error("转发失败，找不到帖子:",postId);return}
const postTitle=post.title||(post.text.match(/^【([^】]+)】/)?post.text.match(/^【([^】]+)】/)[1]:`来自${post.author}的微博`);const summaryText=post.text.replace(/^【[^】]+】/,'').trim();const weiboForwardData={type:'weibo_post',postId:post.postId,title:postTitle,author:post.author,summary:summaryText.substring(0,50)+'...'};showForwardTargetModal([JSON.stringify(weiboForwardData)],'forward')}
function showDiaryOwnerSelectionModal(){return new Promise(resolve=>{const modal=document.getElementById('diary-owner-modal');const listContainer=modal.querySelector('.diary-owner-list-container');const closeBtn=modal.querySelector('.close-btn');const newListContainer=listContainer.cloneNode(!1);listContainer.parentNode.replaceChild(newListContainer,listContainer);const cleanupAndResolve=(value)=>{modal.style.display='none';resolve(value)};contacts.forEach(contact=>{const item=document.createElement('div');item.className='diary-owner-list-item';item.innerHTML=`
                <img src="${getAvatar(contact.id)}" alt="${getDisplayName(contact.id, null)}">
                <span>${getDisplayName(contact.id, null)}</span>
            `;item.addEventListener('click',()=>{cleanupAndResolve(contact.id)});newListContainer.appendChild(item)});closeBtn.onclick=()=>cleanupAndResolve(null);modal.style.display='flex'})}
function getDiaryCreationContextForAI(ownerId){const contact=contacts.find(c=>c.id===ownerId);if(!contact){console.error(`[日记功能] 无法为 ${ownerId} 创建上下文，角色不存在。`);return null}
const finalPrompt=`
[SYSTEM NOTE: HIGH-QUALITY DIARY ENTRY CREATION TASK]

**Core Role to Portray:**
Your only identity is **【${getDisplayName(ownerId, null)} (ID: ${ownerId})】**.
You must deeply embody this character's personality, memories, and current mood.

**Task Instruction:**
Based on your character's persona and your memory of recent events, write a new diary entry. Your response must contain all of the following elements.

**【CRITICAL】Output Format:**
You **must strictly** follow this JSON format. Do not output any other text or explanations. The "content" field should be **plain text**, with paragraphs separated by newlines.

DIARY_ENTRY:{"title": "日记标题", "weather": "天气状况", "content": "日记正文第一段...\\n\\n日记正文第二段..."}

**【CRITICAL】Content Rules:**
1. **Length:** The "content" must be **around 300 Chinese characters**.
2. **Formatting:** The "content" must be **plain text only**. Do NOT use any HTML tags like <p>, <del>, etc. Use newline characters (\\n) to separate paragraphs.
		
		Now, as **【${getDisplayName(ownerId, null)}】**, please begin writing your diary entry strictly following the JSON format above.
		`;return finalPrompt.trim()}
function handleWeiboReply(e){const replyBtn=e.currentTarget;const replyToName=replyBtn.dataset.replyTo;if(replyToName){const inputField=document.querySelector('#weibo-detail-view .weibo-comment-input');inputField.value=`回复 @${replyToName}: `;inputField.focus();inputField.setSelectionRange(inputField.value.length,inputField.value.length)}}
function parseAndStoreWeiboResponse(rawResponse,category){const lines=rawResponse.trim().split('\n');const postRegex=/^WEIBO_POST:(.*)$/;lines.forEach(line=>{const match=line.trim().match(postRegex);if(match){try{const data=JSON.parse(match[1]);data.postId=`weibo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;data.category=category;if(!blmxManager.logEntries.some(entry=>entry.key==='WEIBO_POST'&&entry.data.postId===data.postId)){blmxManager.addEntry({key:'WEIBO_POST',data:data});console.log(`[BLMX Weibo] Stored new post: ${data.postId} in category ${data.category}`)}}catch(e){console.error("[BLMX Weibo] Failed to parse WEIBO_POST JSON:",match[1],e)}}});updateWeiboDataFromLog()}
function applyDiaryBackground(ownerId){const diaryEntryBody=document.querySelector('#diary-entry-view .diary-entry-body');const owner=contacts.find(c=>c.id===ownerId);if(owner&&owner.diaryWallpaper){diaryEntryBody.style.backgroundImage=`url("${owner.diaryWallpaper}")`}else{diaryEntrybody.style.backgroundImage='none'}}
async function handleDiaryBgChange(){const entryView=document.getElementById('diary-entry-view');const ownerId=entryView.dataset.ownerId;if(!ownerId){await showDialog({mode:'alert',text:'错误：找不到日记主人信息。'});return}
const owner=contacts.find(c=>c.id===ownerId);if(!owner)return;const newUrl=await showDialog({mode:'prompt',text:`为 ${getDisplayName(owner.id, null)} 的日记设置背景图URL：\n（留空则恢复默认）`,defaultValue:owner.diaryWallpaper||''});if(newUrl!==null){owner.diaryWallpaper=newUrl.trim()||undefined;saveData();applyDiaryBackground(ownerId);await showDialog({mode:'alert',text:'背景已更新！'})}}
async function handleDeleteDiaryEntry(){const entryView=document.getElementById('diary-entry-view');const entryIndex=parseInt(entryView.dataset.viewingIndex,10);if(isNaN(entryIndex)||entryIndex<0){await showDialog({mode:'alert',text:'错误：当前没有可删除的日记。'});return}
const confirmed=await showDialog({mode:'confirm',text:'确定要永久删除这篇日记吗？此操作不可撤销。'});if(confirmed){blmxManager.logEntries.splice(entryIndex,1);await blmxManager.persistLogToStorage();await showDialog({mode:'alert',text:'日记已删除。'});const ownerId=entryView.dataset.ownerId;navigateTo('diaryEntry',{ownerId:ownerId})}}
function applyDiaryBackground(ownerId){const diaryView=document.getElementById('diary-entry-view');if(!diaryView)return;const owner=contacts.find(c=>c.id===ownerId);if(owner&&owner.diaryWallpaper){diaryView.style.backgroundImage=`url("${owner.diaryWallpaper}")`}else{diaryView.style.backgroundImage='none'}}
function renderDiaryBookmarks(){const bookmarksContainer=document.querySelector('.diary-bookmarks-container');bookmarksContainer.innerHTML='';if(!blmxManager)return;const authorIds=[...new Set(blmxManager.logEntries.filter(entry=>entry.key==='DIARY_ENTRY').map(entry=>entry.data.author))];authorIds.forEach(authorId=>{const bookmark=document.createElement('div');bookmark.className='diary-bookmark-item';bookmark.textContent=getDisplayName(authorId,null);bookmark.dataset.authorId=authorId;bookmark.addEventListener('click',(e)=>{e.stopPropagation();const id=e.currentTarget.dataset.authorId;if(id){navigateTo('diaryEntry',{ownerId:id})}});bookmarksContainer.appendChild(bookmark)})}
function updateWeiboDataFromLog(){weiboData.posts=[];weiboData.comments={};weiboData.likes={};blmxManager.logEntries.forEach(entry=>{if(entry.key==='WEIBO_POST'){weiboData.posts.push(entry.data)}else if(entry.key==='WEIBO_COMMENT'){const comment=entry.data;const targetPostId=comment.postId||comment.target_post_id;if(targetPostId){if(!weiboData.comments[targetPostId]){weiboData.comments[targetPostId]=[]}
weiboData.comments[targetPostId].push(comment)}else{console.warn("[BLMX Weibo] Found a comment without a valid postId or target_post_id:",comment)}}else if(entry.key==='WEIBO_LIKE'){const like=entry.data;const targetPostId=like.postId||like.target_post_id;if(targetPostId){if(!weiboData.likes[targetPostId]){weiboData.likes[targetPostId]=[]}
if(!weiboData.likes[targetPostId].includes(like.author)){weiboData.likes[targetPostId].push(like.author)}}}});for(const postId in weiboData.comments){weiboData.comments[postId].sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp))}
console.log('[BLMX Weibo] Weibo data cache updated from log.',weiboData);updateWeiboZoneIndicators()}
function stageAndDisplayEntry(entry){if(!currentConversationId){alert("错误：没有活动的聊天窗口。");return}
const conversation=conversations.find(c=>c.id===currentConversationId);if(conversation&&conversation.muted&&(conversation.muted.user||conversation.muted['{{user}}'])){const muteInfo=conversation.muted.user||conversation.muted['{{user}}'];const muteUntil=new Date(muteInfo);if(new Date()<muteUntil){alert("你已被禁言！");return}}
const uiEntry={...entry,conversationId:currentConversationId,sender:'{{user}}',id:`msg-pending-${Date.now()}-${Math.random()}`};if(conversation){conversation.lastActivity=new Date(window.currentGameDate).getTime()}
userMessageQueue.push(uiEntry);renderChatHistory(currentConversationId);updateFooterButtonsState()}
async function triggerAiResponse(isMergeSendOrForce,isObserverPoke=!1){if(isGenerating||!blmxManager)return;uiNeedsRefresh=!1;const useGlobalContext=isMergeSendOrForce&&!isObserverPoke?await showDialog({mode:'confirm',text:'是否启用全局模式进行回复？\n(是 = AI可回复所有新消息的对话)\n(否 = AI仅回复当前对话)'}):!1;isGenerating=!0;updateFooterButtonsState();let activeConvoIds=[];if(isObserverPoke&&currentConversationId){activeConvoIds.push(currentConversationId)}else if(useGlobalContext){activeConvoIds=conversations.filter(c=>userMessageQueue.some(m=>m.conversationId===c.id)).map(c=>c.id);if(hasPendingNotifications&&currentConversationId&&!activeConvoIds.includes(currentConversationId)){activeConvoIds.push(currentConversationId)}}else{activeConvoIds=userMessageQueue.length>0?[userMessageQueue[0].conversationId]:(currentConversationId?[currentConversationId]:[])}
if(isMergeSendOrForce&&userMessageQueue.length===0&&activeConvoIds.length===0&&currentConversationId){activeConvoIds.push(currentConversationId)}
if(activeConvoIds.length===0){isGenerating=!1;updateFooterButtonsState();return}
const messagesToProcess=[...userMessageQueue];userMessageQueue=[];hasPendingNotifications=!1;messagesToProcess.forEach(entry=>blmxManager.addEntry(entry));const now=new Date(window.currentGameDate);conversations.forEach(convo=>{if(convo.muted){for(const memberId in convo.muted){if(now>=new Date(convo.muted[memberId])){delete convo.muted[memberId];blmxManager.addEntry({type:'group_event',content:{type:'unmute_auto',convoId:convo.id,targetId:memberId,timestamp:now.toISOString().substring(0,16).replace('T',' ')}})}}}});await blmxManager.persistLogToStorage();let contextForAI;if(isObserverPoke){const conversation=conversations.find(c=>c.id===currentConversationId);contextForAI=getPrivateChatContextForAI(conversation)}else{contextForAI=blmxManager.getContextForAI(activeConvoIds,contacts,conversations,useGlobalContext,isObserverPoke,{})}
latestPromptSentToAI=contextForAI;try{const finalAiResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1});latestAiRawResponse=finalAiResponse.trim();const responseLines=finalAiResponse.trim().split('\n').filter(line=>line.trim());if(responseLines.length>0){const chatRelatedCommands=['EVENT_LOG','GROUP_EVENT','SIGNATURE_UPDATE','RECALL_MESSAGE','CREATE_GROUP','KICK_MEMBER','LEAVE_GROUP','MUTE_MEMBER','SET_ADMIN','CHANGE_NICKNAME','RENAME_GROUP'];const otherCommandsToDelegate=[];let wasComplexCommandDelegated=!1;for(const line of responseLines){const chatMatch=line.match(/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/);const commandMatch=line.match(/^([A-Z_]+):/);if(chatMatch){handleAiChatMessage(chatMatch[3],chatMatch[2].trim(),chatMatch[1])}else if(commandMatch&&chatRelatedCommands.includes(commandMatch[1])){try{const key=commandMatch[1];const data=JSON.parse(line.substring(key.length+1));handleAiSystemCommand(key,data)}catch(e){console.error(`[BLMX trigger] 解析聊天指令失败: "${line}"`,e)}}else{otherCommandsToDelegate.push(line)}}
if(otherCommandsToDelegate.length>0){wasComplexCommandDelegated=!0;await parseAndHandleAiResponse(otherCommandsToDelegate.join('\n'))}
if(uiNeedsRefresh&&!wasComplexCommandDelegated){console.log('[BLMX UI Fix] 安全网触发：为纯聊天消息刷新UI。');if(Views.wechatChat.classList.contains('active')){renderChatHistory(currentConversationId)}
renderConversationList();updateAppBadge()}}}catch(error){console.error(`[BLMX] AI generation failed:`,error);await showDialog({mode:'alert',text:`AI响应失败: ${error.message}`})}
await blmxManager.persistLogToStorage();saveData();isGenerating=!1;updateFooterButtonsState()}
async function triggerAiSummaryAndClear(){if(isGenerating){await showDialog({mode:'alert',text:'AI正在处理其他任务，请稍后再试。'});return}
if(blmxManager.logEntries.length<10){await showDialog({mode:'alert',text:'历史记录过少，无需存档。'});return}
console.log("[Archive] Starting AI Summary and Clear process...");isGenerating=!0;updateFooterButtonsState();await showDialog({mode:'alert',text:'AI正在阅读并总结所有历史记录，这可能需要一些时间，请耐心等待...'});try{const contextForAI=getSummaryContextForAI();latestPromptSentToAI=contextForAI;const rawResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1});latestAiRawResponse=rawResponse;let summaryText="AI未能生成有效的总结。历史记录未被清除。";let summarySuccess=!1;try{const responseObject=JSON.parse(rawResponse.trim());if(responseObject.summary&&typeof responseObject.summary==='string'&&responseObject.summary.trim()){summaryText=`【历史存档摘要】:\n${responseObject.summary.trim()}`;summarySuccess=!0}}catch(e){console.error("[Archive] AI returned invalid JSON. Using raw response as summary.",e,rawResponse);summaryText=`【历史存档摘要】:\nAI未能按格式生成总结，原始回复为：\n${rawResponse.trim()}`}
if(summarySuccess){const messageIdToEdit=blmxManager.messageId;await window.parent.TavernHelper.setChatMessage(summaryText,messageIdToEdit,{refresh:"none"});blmxManager.logEntries=[];blmxManager.messageId=await window.parent.TavernHelper.getLastMessageId();updateWeiboDataFromLog();renderConversationList();updateAppBadge();if(Views.wechatChat.classList.contains('active')){renderChatHistory(currentConversationId)}
await showDialog({mode:'alert',text:'历史记录已成功总结并存档！手机性能已恢复。'})}else{await showDialog({mode:'alert',text:summaryText})}}catch(error){console.error("[Archive] AI summary generation failed:",error);await showDialog({mode:'alert',text:`AI总结失败: ${error.message}`})}finally{isGenerating=!1;updateFooterButtonsState()}}
function getSummaryContextForAI(){const systemPrompt=`[任务：生成详细的结构化历史档案]

**你的核心任务**:
阅读下方提供的所有“手机记录”，总结手机上发生的所有事件。

**【最高准则】**:
1. **整理并串联事件**: 你的任务是创建一个详略得当的事件档案，而不是简单的信息罗列。请将相关的对话、行动和事件联系起来，按时间或主题进行清晰地阐述。
2. **强制结构化输出**: 档案内容必须严格遵循以下的分类结构进行组织。如果某个分类下没有发生任何值得记录的重要动态，则直接省略该分类标题。
3. **绝对客观**: 保持中立，只陈述事实，严禁添加任何主观评价或分析。
4. **信息来源唯一**: 你的总结必须只基于下方提供的“手机记录”。
5. **详尽记录**:400字以内总结，请确保包含了重要的情节转折、关键对话、以及能够反映角色关系和状态变化的重要细节。

**【档案内容结构模板】**
* **【微信】**
* 总结各私聊和群聊中的核心事件、重要对话内容及最终结果。
* **【朋友圈】**
* 总结谁发布了重要的动态，动态的内容，以及引发了哪些角色的关键互动。
* **【论坛】**
* 总结角色在论坛中发布的有影响力的帖子或参与的重要讨论。
* **【日记】**
* 总结角色日记中反映出的关键心路历程或秘密（如有）。
* **【其他重要事件】**
* 总结如“修改签名”、“群聊变动”等其他系统层面的关键事件。

**【最终输出格式】**
你的回复中 **只能包含** 下方的“逐行指令”格式，每一条指令独立成行，严禁生成任何额外的解释，严禁生成任何剧情或旁白。

**格式示例**:
{"summary":"* **【微信】**\\n * 司洛对新项目的设计方案产生分歧，连续发送了三条消息表示反对，认为风险过高鹿言则解释了方案的可行性，双方最终约定次日进行线下会议讨论。\\n * 在“摸鱼小分队”群聊中，魏月华提议周末去新开的日料店聚餐，得到了司洛和桑洛凡的同意。\\n* **【朋友圈】**\\n * 舟不渡发布了一条配图为海边风景的动态。\\n* **【其他重要事件】**\\n * 司洛将自己的个性签名从“保持学习”修改为“保持专注”。"}
`;let chatHistory='\n\n--- 手机记录: 微信聊天 ---\n';const chatEntries=blmxManager.logEntries.filter(e=>e.conversationId&&e.type&&!['event_log','group_event'].includes(e.type));chatEntries.forEach(entry=>{const convo=conversations.find(c=>c.id===entry.conversationId);let convoName;if(convo){if(convo.type==='group'||convo.type==='vgroup'){convoName=convo.name}else if(convo.type==='single'){const memberNames=convo.members.map(id=>getDisplayName(id,null));convoName=`${memberNames.join('与')}的私聊`}else{convoName='未知聊天'}}else{convoName='未知聊天'}
const senderName=getDisplayName(entry.sender,entry.conversationId);let contentText='';switch(entry.type){case 'message':contentText=entry.content;break;case 'voice':contentText=`[发送了语音: "${entry.content.text}"]`;break;default:contentText=`[发送了 ${entry.type}]`;break}
chatHistory+=`[在${convoName}] ${senderName}: ${contentText}\n`});let momentsHistory='\n\n--- 手机记录: 朋友圈 ---\n';const momentEntries=blmxManager.logEntries.filter(e=>e.key==='MOMENT');momentEntries.forEach(entry=>{const post=entry.data;momentsHistory+=`[作者: ${getDisplayName(post.author, null)} 时间: ${post.timestamp}]: "${post.text || '(图片动态)'}"\n`;const interactions=blmxManager.logEntries.filter(e=>(e.key==='CHAR_LIKE'||e.key==='CHAR_COMMENT')&&e.data.target_post_id===post.momentId);interactions.forEach(inter=>{if(inter.key==='CHAR_LIKE'){momentsHistory+=` - 点赞: ${getDisplayName(inter.data.author, null)}\n`}else{momentsHistory+=` - 评论 by ${getDisplayName(inter.data.author, null)}: "${inter.data.text}"\n`}})});let weiboHistory='\n\n--- 手机记录: 论坛 ---\n';const weiboPosts=blmxManager.logEntries.filter(e=>e.key==='WEIBO_POST');weiboPosts.forEach(entry=>{const post=entry.data;weiboHistory+=`[作者: ${getDisplayName(post.author, null)} 分区: ${post.category}]: "${post.title || post.text}"\n`});let diaryHistory='\n\n--- 手机记录: 日记 ---\n';const diaryEntries=blmxManager.logEntries.filter(e=>e.key==='DIARY_ENTRY');diaryEntries.forEach(entry=>{const diary=entry.data;const contentSnippet=(diary.content||'').substring(0,100);diaryHistory+=`[作者: ${getDisplayName(diary.author, null)} 时间: ${diary.timestamp} 标题: "${diary.title}"]: ${contentSnippet}...\n`});let otherEventsHistory='\n\n--- 手机记录: 其他重要事件 ---\n';const otherEvents=blmxManager.logEntries.filter(e=>['SIGNATURE_UPDATE','EVENT_LOG','GROUP_EVENT'].includes(e.key||e.type));otherEvents.forEach(entry=>{const key=entry.key||entry.type.toUpperCase();switch(key){case 'SIGNATURE_UPDATE':otherEventsHistory+=`[签名更新 by ${getDisplayName(entry.data.author, null)}]: "${entry.data.signature}"\n`;break;case 'EVENT_LOG':otherEventsHistory+=`[系统事件]: ${entry.content.description}\n`;break;case 'GROUP_EVENT':otherEventsHistory+=`[群聊事件]: ${getGroupEventDescription(entry.content)}\n`;break}});const fullContext=systemPrompt+chatHistory+momentsHistory+weiboHistory+diaryHistory+otherEventsHistory;return fullContext}
function showCharacterSelectionModal(){return new Promise(resolve=>{const modal=document.getElementById('group-chat-modal');const listContainer=document.getElementById('group-chat-contact-list-container');const header=document.getElementById('group-chat-modal-header');const footer=document.getElementById('group-chat-modal-footer');listContainer.innerHTML='';header.querySelector('.title').textContent='选择一个作者';header.querySelector('#group-chat-confirm-btn').style.display='none';footer.style.display='none';const cleanupAndResolve=(value)=>{const newContainer=listContainer.cloneNode(!1);listContainer.parentNode.replaceChild(newContainer,listContainer);modal.style.display='none';resolve(value)};const cancelBtn=header.querySelector('#group-chat-cancel-btn');const newCancelBtn=cancelBtn.cloneNode(!0);cancelBtn.parentNode.replaceChild(newCancelBtn,cancelBtn);newCancelBtn.onclick=()=>cleanupAndResolve(null);contacts.forEach(contact=>{const item=document.createElement('div');item.className='group-chat-contact-item';item.style.cursor='pointer';item.innerHTML=`
                <img src="${getAvatar(contact.id)}" alt="${getDisplayName(contact.id, null)}">
                <span>${getDisplayName(contact.id, null)}</span>
            `;item.addEventListener('click',()=>{cleanupAndResolve(contact.id)});listContainer.appendChild(item)});modal.style.display='flex'})}
function getInitialFeedPrompt(category){const categoryName=document.querySelector(`.weibo-zone-card[data-category="${category}"] .zone-title`).textContent;const communityBible=getCommunityBibleForCategory(category);const finalPrompt=`
[任务: 论坛初始内容生成]

* **核心身份**: 你的身份是“论坛生态模拟引擎”。你的任务是为【${categoryName}】这个全新的分区，生成第一批帖子，营造出社区已经开始活跃的氛围。

* **环境参考**: 请严格参考下方的“社区圣经”，确保你生成的帖子标题和作者身份都符合该分区的定位和用户画像。
${communityBible}

* **产出要求 (必须严格遵守)**:
1. **置顶帖 (1条)**: 生成一条重要的置顶帖。可以是**新人引导**、**版主公告**或**重大活动**。
2. **热门帖 (2-3条)**: 生成几条有争议或能引发热烈讨论的热门话题。
3. **多样化普通帖 (3-4条)**: 生成一些符合社区日常氛围的帖子。**请大胆尝试使用不同的帖子类型前缀**，例如：\`[闲聊]\`、\`[提问]\`、\`[分享]\`、\`[投票]\`、\`[直播]\`等，来丰富版面生态。

* **作者身份**: 帖子的作者(\`author\`字段)可以是已知角色名，也可以是符合社区画像的虚拟路人名 (例如：“深蓝档案”、“吃瓜第一线”)。请自由分配。

[技术要求：输出格式]
你的回复中 **只能包含** 下方的“逐行指令”格式，每一条指令独立成行，严禁任何额外的解释。

FORUM_THREAD:{"title":"帖子标题","author":"作者名","isPinned":布尔值,"hotness":整数}

* **字段解读**:
* \`title\`: 吸引人的帖子标题，可包含类型前缀如 [投票]。
* \`author\`: 发帖的作者名。
* \`isPinned\`: **只有置顶帖为 \`true\`**，其他都为 \`false\`。
* \`hotness\`: 帖子的热度值。请为热门帖赋予一个较高的数值 (如 300-500)，普通帖赋予一个较低的数值 (如 5-50)。

* **【输出示例】**:
FORUM_THREAD:{"title":"[置顶] 欢迎来到情感树洞！发帖前请阅读版规~","author":"版主BOT","isPinned":true,"hotness":999}
FORUM_THREAD:{"title":"[投票] 你认为恋爱中最重要的是什么？","author":"情感观察员","isPinned":false,"hotness":450}
FORUM_THREAD:{"title":"[直播] 深夜emo, 随便聊聊最近的烦心事","author":"匿名小狗","isPinned":false,"hotness":310}
FORUM_THREAD:{"title":"[求助] 暗恋了很久的朋友突然要结婚了，怎么办...","author":"迷路的麋鹿","isPinned":false,"hotness":280}
FORUM_THREAD:{"title":"[分享] 楼下的猫又在吵架，录下来了好好笑。","author":"喵喵观察员","isPinned":false,"hotness":23}

[你的指令]
现在，请严格遵循以上格式和示例，为【${categoryName}】分区生成初始的帖子列表。`;return finalPrompt.trim()}
function getCommunityBibleForCategory(category){const zones=getWeiboZones();const targetZone=zones.find(z=>z.id===category);if(targetZone&&targetZone.communityBible){return targetZone.communityBible}
console.warn(`[AI Context] Could not find community bible for category: ${category}. Using fallback.`);return'【错误】未找到对应的社区说明。请基于通用知识进行创作。'}
async function handleCreateWeiboPost(){if(isGenerating){await showDialog({mode:'alert',text:'AI正在生成中，请稍后再试。'});return}
const feedView=document.getElementById('weibo-feed-view');const feedTitleEl=document.getElementById('weibo-feed-title');const categoryName=feedTitleEl.textContent;let category='';const zoneCard=Array.from(document.querySelectorAll('.weibo-zone-card')).find(card=>card.querySelector('.zone-title').textContent===categoryName);if(zoneCard){category=zoneCard.dataset.category}else{await showDialog({mode:'alert',text:'错误：无法确定当前帖子分区。'});return}
const result=await showMultiInputDialog({title:'发布新微博',fields:[{id:'title',label:'帖子标题',type:'text'},{id:'body',label:'帖子正文',type:'textarea'},{id:'image_url',label:'图片链接 (可选, 优先使用)',type:'text'},{id:'image_desc',label:'或 图片描述 (可选)',type:'text'}]});if(result===null){return}
const{title,body,image_url,image_desc}=result;let image="";let image_type="none";if(image_url&&image_url.trim()){image_type='url';image=image_url.trim()}else if(image_desc&&image_desc.trim()){image_type='desc';image=image_desc.trim()}
if(!title.trim()&&!body.trim()&&!image.trim()){await showDialog({mode:'alert',text:'标题、正文和图片至少需要填写一项。'});return}
const postAnonymously=await showDialog({mode:'confirm',text:'如何发布这篇帖子？\n\n(确定 = 匿名发布)\n(取消 = 实名发布)'});let authorId;if(postAnonymously){const identity=getAnonymousIdentity();if(identity&&identity.name){authorId=identity.name}else{await showDialog({mode:'alert',text:'请先通过右上角的齿轮设置您的马甲才能匿名发帖。'});return}}else{authorId=userProfile.id}
const postData={author:authorId,title:title,text:body,image_type:image_type,image:image,postId:`weibo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${userProfile.id}`,category:category,timestamp:new Date(window.currentGameDate).toISOString(),likes:Math.floor(Math.random()*100),retweets:Math.floor(Math.random()*21),bookmarks:Math.floor(Math.random()*11)};blmxManager.addEntry({key:'WEIBO_POST',data:postData});if(postData.image_type==='desc'&&postData.image){processEntryWithNAI(postData.postId,postData.image,'weibo')}
await blmxManager.persistLogToStorage();updateWeiboDataFromLog();renderWeiboFeed(category);navigateTo('weiboFeed',{category:category,categoryName:categoryName});await showDialog({mode:'alert',text:`新帖子已成功发布！`})}
async function handleCreateDiaryEntry(){if(isGenerating){await showDialog({mode:'alert',text:'AI正在生成中，请稍后再试。'});return}
const ownerId=document.getElementById('diary-entry-view').dataset.ownerId;if(!ownerId){console.error("创建日记失败：无法获取日记主人ID。");await showDialog({mode:'alert',text:'无法确定为谁写日记，请返回封面页重新进入。'});return}
const ownerName=getDisplayName(ownerId,null);const confirmed=await showDialog({mode:'confirm',text:`是否要探寻一下 ${ownerName} 此刻的心事，并让Ta记录下来？`});if(confirmed){await showDialog({mode:'alert',text:`正在探寻 ${ownerName} 的心事，请稍候...`});await triggerAiDiaryCreation(ownerId)}}
async function triggerAiDiaryCreation(ownerId){if(isGenerating){await showDialog({mode:'alert',text:'AI正在生成中，请稍后再试。'});return}
console.log(`[日记功能] 开始为 ${ownerId} 创建日记...`);isGenerating=!0;updateFooterButtonsState();const contextForAI=getDiaryCreationContextForAI(ownerId);if(!contextForAI){await showDialog({mode:'alert',text:'无法生成AI指令，请检查角色是否存在。'});isGenerating=!1;updateFooterButtonsState();return}
latestPromptSentToAI=contextForAI;try{const rawResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1});latestAiRawResponse=rawResponse;if(rawResponse.trim()){await parseAndHandleAiResponse(rawResponse);await showDialog({mode:'alert',text:`${getDisplayName(ownerId, null)} 的新日记已写好！`})}else{await showDialog({mode:'alert',text:'AI未能生成有效的日记内容。'})}}catch(error){console.error(`[日记功能] AI生成日记失败:`,error);await showDialog({mode:'alert',text:`AI响应失败: ${error.message}`})}finally{isGenerating=!1;updateFooterButtonsState();if(document.getElementById('diary-entry-view').classList.contains('active')){navigateTo('diaryEntry',{ownerId:ownerId})}}}
async function handleTriggerWorldSnapshot(){if(isGenerating){await showDialog({mode:'alert',text:'AI正在思考中，请稍后再试。'});return}
const confirmed=await showDialog({mode:'confirm',text:'是否要让时间流逝，看看角色们发生了什么？\n(这将消耗一次API调用来生成全局动态)'});if(!confirmed){return}
isGenerating=!0;updateFooterButtonsState();await showDialog({mode:'alert',text:'正在捕捉世界动态，请稍候...'});try{const contextForAI=getSnapshotContextForAI();if(!contextForAI)throw new Error("无法生成有效的AI上下文。");latestPromptSentToAI=contextForAI;const rawResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1,});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){await displayWorldSnapshotModal(latestAiRawResponse);const lines=latestAiRawResponse.split('\n').filter(line=>line.trim());const complexCommands=[];for(const line of lines){const chatMatch=line.match(/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/);if(chatMatch){const convoId=chatMatch[1];const senderId=chatMatch[2].trim();const content=chatMatch[3];handleAiChatMessage(content,senderId,convoId)}else{complexCommands.push(line)}}
if(complexCommands.length>0){await parseAndHandleAiResponse(complexCommands.join('\n'))}else{renderConversationList();updateAppBadge()}
await showDialog({mode:'alert',text:'世界动态已同步！'})}else{await showDialog({mode:'alert',text:'时间静止，角色们似乎都在休息。'})}}catch(error){console.error("[BLMX World Snapshot] AI generation failed:",error);await showDialog({mode:'alert',text:`世界快照生成失败: ${error.message}`})}finally{isGenerating=!1;updateFooterButtonsState()}}
function getSnapshotContextForAI(){const allZones=getWeiboZones();let zonesMenu=allZones.map(zone=>`- 【${zone.title}】(ID: ${zone.id})`).join('\n');const finalPrompt=`
[任务：世界动态导演]

**你的身份**: 世界的幕后导演。
**你的记忆**: 你已经通过主上下文知晓了至今为止发生的所有故事。
**你的任务**: 基于你的记忆，构思并执行 **2-4** 件接下来会发生的、合乎角色逻辑的新事件。

---
**【你的行动菜单与输出格式（必须严格遵守）】**

你只能从下面的选项中选择行动，并严格按照对应的格式输出，每一条指令占一行，严禁任何额外解释。

**1. 发朋友圈动态 (MOMENT)**
格式: \`MOMENT:{"author":"角色ID","text":"朋友圈文字内容", "timestamp":"YYYY-MM-DDTHH:mm"}\`

**2. 更新个性签名 (SIGNATURE_UPDATE)**
格式: \`SIGNATURE_UPDATE:{"author":"角色ID","signature":"新的个性签名"}\`

**3. 在论坛发一个新帖子 (WEIBO_POST)**
* **可用分区菜单**:
${zonesMenu}
* **格式要求**: 你的JSON中必须包含 \`author\`, \`category\`, \`timestamp\`。\`title\` 或 \`text\` 至少需要一个。
* **图片 (可选)**: 如需配图，你 **必须** 在JSON中提供 \`image\` 和 \`image_type\` 两个字段。
* \`image_type\`: 必须是 \`"url"\` (图片链接) 或 \`"desc"\` (图片描述) 中的一个。
* \`image\`: 存放对应的URL或描述文本。
* **完整格式**: \`WEIBO_POST:{"author":"角色ID","category":"分区ID","title":"标题","text":"正文","timestamp":"YYYY-MM-DDTHH:mm","image":"图片URL或描述","image_type":"url或desc"}\`

**4. 发起或参与聊天 (私聊/群聊/虚拟群聊)**
* **私聊格式**: \`[convo_single_对方ID] 你的ID: 聊天内容\`
* **群聊格式**: \`[convo_group_成员A-成员B-...] 你的ID: 聊天内容\` (成员ID按字母排序)
* **虚拟群聊格式**: \`[convo_vgroup_群聊名称] 你的ID或虚拟身份: 聊天内容\`

---
**【输出示例】**
MOMENT:{"author":"舟不渡","text":"今天的夕阳真美。","timestamp":"2025-10-20T18:30"}
SIGNATURE_UPDATE:{"author":"舟不渡","signature":"心有所向，日夜兼程。"}
WEIBO_POST:{"author":"理科男不懂爱","category":"life","title":"新买的机械键盘到了","text":"手感确实不错。","timestamp":"2025-10-20T19:00","image":"键盘在桌子上的照片，有RGB背光。","image_type":"desc"}
[convo_single_草莓牛奶] 草莓牛奶: 舟不渡学长，在吗？有个问题想问你。
[convo_group_理科男不懂爱-舟不渡-草莓牛奶] 理科男不懂爱: 晚上的小组讨论别忘了。
[convo_vgroup_学习交流群] 学习委员: 提醒一下，明天要交上周的报告。

[你的指令]
现在，请基于你的记忆，开始导演。严格遵循格式，返回你的行动清单。
`;return finalPrompt.trim()}
async function displayWorldSnapshotModal(rawResponse){return new Promise(resolve=>{const modal=document.getElementById('world-snapshot-modal');const contentEl=document.getElementById('world-snapshot-content');const closeBtn=document.getElementById('world-snapshot-close-btn');const timePassed=Math.floor(Math.random()*3)+2;let modalContentHtml=`<h3>【世界动态快照：${timePassed}小时后】</h3>`;const lines=rawResponse.trim().split('\n');lines.forEach(line=>{let itemHtml='';const chatMatch=line.match(/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/);if(chatMatch){const convoId=chatMatch[1];const senderId=chatMatch[2].trim();const content=chatMatch[3];let description='';const singleMatch=convoId.match(/^convo_single_(.+)$/);const groupMatch=convoId.match(/^convo_group_(.+)$/);if(singleMatch){const charId=singleMatch[1];const receiverId=(senderId===charId)?'user':charId;description=`<strong>${getDisplayName(senderId, null)}</strong> 私下对 <strong>${getDisplayName(receiverId, null)}</strong> 说：“${content.substring(0, 50)}...”`}else if(groupMatch){const convo=conversations.find(c=>c.id===convoId);const convoName=convo?convo.name:'一个群聊';description=`<strong>${getDisplayName(senderId, convoId)}</strong> 在群聊“${convoName}”中说：“${content.substring(0, 50)}...”`}
if(description){itemHtml=`
<div class="snapshot-item">
	<div class="snapshot-icon type-wechat"><i class="fab fa-weixin"></i></div>
	<div class="snapshot-text">${description}</div>
</div>`}}else{const commandMatch=line.match(/^([A-Z_]+):(.*)$/);if(commandMatch){const key=commandMatch[1];try{const data=JSON.parse(commandMatch[2]);let description='';let iconClass='type-system';let iconHtml='<i class="fas fa-cog"></i>';switch(key){case 'WEIBO_POST':const zone=getWeiboZones().find(z=>z.id===data.category);const zoneName=zone?zone.title:'某个分区';description=`<strong>${getDisplayName(data.author, null)}</strong> 在 <strong>【${zoneName}】</strong> 发布了新帖子：“${data.title}”`;iconClass='type-forum';iconHtml='<i class="fas fa-fire"></i>';break;case 'MOMENT':description=`<strong>${getDisplayName(data.author, null)}</strong> 发布了一条新动态：“${(data.text || '[图片动态]').substring(0, 50)}...”`;iconClass='type-moments';iconHtml='<i class="far fa-images"></i>';break;case 'WEIBO_COMMENT':const post=weiboData.posts.find(p=>p.postId===data.target_post_id);const postTitle=post?post.title:'一个帖子';description=`<strong>${getDisplayName(data.author, null)}</strong> 评论了帖子“${postTitle}”`;iconClass='type-forum';iconHtml='<i class="fas fa-fire"></i>';break;case 'SIGNATURE_UPDATE':description=`<strong>${getDisplayName(data.author, null)}</strong> 的个性签名更新为：“${data.signature}”`;iconClass='type-system';iconHtml='<i class="fas fa-user-edit"></i>';break;case 'EVENT_LOG':description=`<strong>[世界事件]</strong> ${data.description}`;iconClass='type-system';iconHtml='<i class="fas fa-globe-asia"></i>';break}
if(description){itemHtml=`
<div class="snapshot-item">
	<div class="snapshot-icon ${iconClass}">${iconHtml}</div>
	<div class="snapshot-text">${description}</div>
</div>`}}catch(e){}}}
if(itemHtml){modalContentHtml+=itemHtml}});contentEl.innerHTML=modalContentHtml;const closeModal=()=>{modal.style.display='none';closeBtn.onclick=null;resolve()};closeBtn.onclick=closeModal;modal.style.display='flex'})}
function handleAiSystemCommand(key,data,contextPostId=null){if(data&&data.convoId&&typeof data.convoId==='string'){data.convoId=data.convoId.replace(/[\[\]]/g,'')}
if(data&&data.convoId&&data.convoId.startsWith('convo_group_')){const parts=data.convoId.substring('convo_group_'.length).split('-');parts.sort();data.convoId=`convo_group_${parts.join('-')}`}
if(key==='WEIBO_POST'||key==='WEIBO_COMMENT'||key==='WEIBO_LIKE'||key==='DELETE_WEIBO_POST'){if(key==='WEIBO_POST'){data.likes=Math.floor(Math.random()*1000);data.retweets=Math.floor(Math.random()*51);data.bookmarks=Math.floor(Math.random()*21)}
if(key==='WEIBO_COMMENT'){data.likes=Math.floor(Math.random()*10);data.commentId=`comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;data.isRead=!1;if(contextPostId){const aiPostId=data.target_post_id;if(aiPostId!==contextPostId){console.warn(`[AI Data Correction] Post ID mismatch! Forcibly changing target_post_id from '${aiPostId}' to '${contextPostId}'.`);data.target_post_id=contextPostId}}}
if(!data.timestamp&&key!=='DELETE_WEIBO_POST'){data.timestamp=new Date(window.currentGameDate).toISOString()}
blmxManager.addEntry({key,data});return}
if(key==='DIARY_ENTRY'){data.author=document.getElementById('diary-entry-view').dataset.ownerId;data.timestamp=new Date(window.currentGameDate).toISOString();blmxManager.addEntry({key:'DIARY_ENTRY',data:data});return}
if(data.convoId&&data.timestamp){updateConversationTimestamp(data.convoId,data.timestamp)}
switch(key){case 'EVENT_LOG':blmxManager.addEntry({type:key.toLowerCase(),content:data});break;case 'SIGNATURE_UPDATE':{const targetId=data.author;let targetObject=null;if(targetId==='user'||targetId==='{{user}}'){targetObject=userProfile}else{targetObject=contacts.find(c=>c.id===targetId)}
if(targetObject){targetObject.signature=data.signature;blmxManager.addEntry({key,data});saveData()}
break}
case 'RECALL_MESSAGE':blmxManager.addEntry({key,data});break;case 'MOMENT':if(!data.momentId){data.momentId=`moment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
if(data.image_type==='desc'&&data.image){processEntryWithNAI(data.momentId,data.image,'moment')}
blmxManager.addEntry({key,data});if(data.author!=='user'&&data.author!=='{{user}}'){const momentsConvo=conversations.find(c=>c.id==='moments_feed');if(momentsConvo){momentsConvo.unread=(momentsConvo.unread||0)+1;updateConversationTimestamp('moments_feed',data.timestamp)}
if(!document.getElementById('moments-view').classList.contains('active')){const authorName=getDisplayName(data.author,null);const contentText=data.text?data.text:'[图片动态]';showBannerNotification('moments_feed',authorName,contentText)}}
lastProcessedMomentId=data.momentId;break;case 'CHAR_COMMENT':case 'CHAR_LIKE':{blmxManager.addEntry({key,data});const allMoments=blmxManager.logEntries.map((e,i)=>({...e,originalIndex:i})).filter(e=>e.key==='MOMENT');const targetPostEntry=allMoments.find(m=>m.data.momentId===String(data.target_post_id));if(targetPostEntry&&(targetPostEntry.data.author==='user'||targetPostEntry.data.author==='{{user}}')){const momentsConvo=conversations.find(c=>c.id==='moments_feed');if(momentsConvo){momentsConvo.unread=(momentsConvo.unread||0)+1;updateConversationTimestamp('moments_feed',new Date(window.currentGameDate).toISOString())}}
break}
case 'INVITE_MEMBER':{const convo=conversations.find(c=>c.id===data.convoId);const inviteeId=data.targetId;if(convo&&convo.type==='group'&&inviteeId){const isUserInvitee=(inviteeId==='user'||inviteeId==='{{user}}'||inviteeId===userProfile.name);const finalInviteeId=isUserInvitee?'user':inviteeId;if(!convo.members.includes(finalInviteeId)){convo.members.push(finalInviteeId);if(isUserInvitee){convo.userIsObserver=!1}
const eventData={type:'add',convoId:data.convoId,author:data.author,targetIds:[finalInviteeId],timestamp:data.timestamp||new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ')};blmxManager.addEntry({type:'group_event',content:eventData});updateConversationTimestamp(data.convoId,eventData.timestamp);uiNeedsRefresh=!0}}
break}
case 'LEAVE_GROUP':{const convo=conversations.find(c=>c.id===data.convoId);const memberIndex=convo?convo.members.indexOf(data.author):-1;if(convo&&memberIndex>-1){convo.members.splice(memberIndex,1);const eventData={type:'leave',convoId:data.convoId,author:data.author,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ')};blmxManager.addEntry({type:'group_event',content:eventData});updateConversationTimestamp(data.convoId,eventData.timestamp)}
break}
case 'KICK_MEMBER':case 'MUTE_MEMBER':case 'SET_ADMIN':case 'CHANGE_NICKNAME':const convo=conversations.find(c=>c.id===data.convoId);if(!convo)break;const actorId=data.author;const actorIsOwner=convo.owner===actorId;const actorIsAdmin=convo.admins&&convo.admins.includes(actorId);let eventData={...data};let permissionOk=!1;let eventType='';if(key==='MUTE_MEMBER'){eventType='mute';if(actorIsOwner||actorIsAdmin){if(!convo.muted)convo.muted={};convo.muted[data.targetId]=new Date(new Date().getTime()+data.duration*60000).toISOString();permissionOk=!0}}else if(key==='KICK_MEMBER'){eventType='kick';if(actorIsOwner||actorIsAdmin){convo.members=convo.members.filter(id=>id!==data.targetId);permissionOk=!0}}else if(key==='SET_ADMIN'){eventType='set_admin';if(actorIsOwner){if(!convo.admins)convo.admins=[];if(!convo.admins.includes(data.targetId))convo.admins.push(data.targetId);permissionOk=!0}}else if(key==='CHANGE_NICKNAME'){eventType='nickname_change';eventData.oldName=getDisplayName(data.targetId,data.convoId);if(!convo.nicknames)convo.nicknames={};if(data.targetId==='user'||data.targetId==='{{user}}'){convo.nicknames.user=data.newName}else{convo.nicknames[data.targetId]=data.newName}
permissionOk=!0}
if(permissionOk){eventData.type=eventType;eventData.timestamp=new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ');blmxManager.addEntry({type:'group_event',content:eventData});updateConversationTimestamp(data.convoId,eventData.timestamp)}
break;case 'RENAME_GROUP':{let convo=conversations.find(c=>c.id===data.convoId);if(!convo){if(currentConversationId&&currentConversationId.startsWith('convo_group_')){convo=conversations.find(c=>c.id===currentConversationId)}
if(!convo){console.warn(`[RENAME_GROUP] 无法通过ID ${data.convoId} 找到群聊，尝试宽容处理...`)}}
if(!convo){console.error(`[RENAME_GROUP] 失败：找不到目标群聊。`);break}
convo.name=data.newName;const now=new Date(window.currentGameDate);const safeTimestamp=data.timestamp?data.timestamp:now.toISOString().substring(0,19);const eventData={type:'rename',convoId:convo.id,author:data.author,newName:data.newName,timestamp:safeTimestamp};blmxManager.addEntry({type:'group_event',content:eventData});if(document.getElementById('wechat-chat-view').classList.contains('active')&&currentConversationId===convo.id){addGroupEventToWeChat(eventData)}
updateConversationTimestamp(convo.id,safeTimestamp);if(currentConversationId===convo.id){const header=document.getElementById('contact-name-header');if(header)header.textContent=`${data.newName} (${convo.members.length})`;const settingsName=document.getElementById('group-settings-name');if(settingsName)settingsName.textContent=data.newName}
saveData()}
break;case 'CREATE_GROUP':{const finalMembers=data.include_user?['user',...data.members]:[...data.members];if(!finalMembers.includes(data.owner)){finalMembers.push(data.owner)}
const uniqueMembers=[...new Set(finalMembers)];const newGroupId=generateDescriptiveGroupId(uniqueMembers);if(!conversations.find(c=>c.id===newGroupId)){const newConvo={id:newGroupId,type:'group',name:data.name,owner:data.owner,members:uniqueMembers,admins:[],avatar:'',userIsObserver:!data.include_user,unread:0,pinned:!1,nicknames:{},dissolved:!1};const eventTimestamp=new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ');blmxManager.addEntry({type:'group_event',content:{type:'create',author:data.owner,convoId:newGroupId,timestamp:eventTimestamp}});newConvo.lastActivity=new Date(eventTimestamp.replace(' ','T')).getTime();conversations.push(newConvo)}else{const existingConvo=conversations.find(c=>c.id===newGroupId);if(existingConvo&&existingConvo.name!==data.name){const eventData={type:'rename',convoId:newGroupId,author:data.owner,newName:data.name,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ')};blmxManager.addEntry({type:'group_event',content:eventData});existingConvo.name=data.name;updateConversationTimestamp(newGroupId,eventData.timestamp)}}
break}
case 'MUSIC_SHARE':const shareData={title:data.title||'未知歌曲',artist:data.artist||'未知歌手',cover:'https://files.catbox.moe/g3x1v8.jpg'};blmxManager.addEntry({type:'music_share',sender:data.author||currentCharId,convoId:data.convoId||currentConversationId,data:shareData,timestamp:new Date(window.currentGameDate).toISOString()});break;case 'FOOTPRINTS':blmxManager.addEntry({type:'footprints',author:data.author,content:data,timestamp:new Date(window.currentGameDate).toISOString()});if(document.getElementById('cp-footprints-view').classList.contains('active')&&currentCheckPhoneTargetId===data.author){renderFootprintsData(data)}
break}}
function handleAiChatMessage(value,senderId,targetConversationId){const nameBasedIdRegex=/^(convo_vgroup_|convo_group_)(.+)$/;const nameMatch=targetConversationId.match(nameBasedIdRegex);let finalTargetConversationId=targetConversationId;if(nameMatch&&!conversations.find(c=>c.id===targetConversationId)){const groupName=nameMatch[2];const targetConversation=conversations.find(c=>c.name===groupName);if(targetConversation){finalTargetConversationId=targetConversation.id}}
if(finalTargetConversationId&&finalTargetConversationId.startsWith('convo_group_')){const parts=finalTargetConversationId.substring('convo_group_'.length).split('-');parts.sort();finalTargetConversationId=`convo_group_${parts.join('-')}`}
let conversation=conversations.find(c=>c.id===finalTargetConversationId);if(conversation&&conversation.type==='single'&&!conversation.members.includes(senderId)){console.log(`[BLMX Redirect] Detected message from non-member '${senderId}' to a single chat. Attempting to redirect...`);const intendedRecipientId=conversation.members.find(m=>m!==senderId);const actualSenderId=senderId;if(intendedRecipientId&&actualSenderId){if(intendedRecipientId==='user'||intendedRecipientId==='{{user}}'||actualSenderId==='user'||actualSenderId==='{{user}}'){const otherCharId=(intendedRecipientId==='user'||intendedRecipientId==='{{user}}')?actualSenderId:intendedRecipientId;const correctSingleChatId=`convo_single_${otherCharId}`;console.log(`[BLMX Redirect] Rerouting to SINGLE chat with {{user}}: ${correctSingleChatId}`);let correctConversation=conversations.find(c=>c.id===correctSingleChatId);if(!correctConversation){console.log(`[BLMX Redirect] Creating new single chat: ${correctSingleChatId}`);const newConversation={id:correctSingleChatId,type:'single',members:['user',otherCharId],unread:0,pinned:!1,lastActivity:new Date(window.currentGameDate).getTime()};conversations.push(newConversation);saveData();correctConversation=newConversation}
finalTargetConversationId=correctSingleChatId;conversation=correctConversation}else{const correctGroupId=generateDescriptiveGroupId([intendedRecipientId,actualSenderId]);console.log(`[BLMX Redirect] Rerouting message from '${actualSenderId}' to '${intendedRecipientId}' into 2-person GROUP chat '${correctGroupId}'.`);let correctConversation=conversations.find(c=>c.id===correctGroupId);if(!correctConversation){console.log(`[BLMX Redirect] Creating new 2-person group chat: ${correctGroupId}`);const memberIds=[intendedRecipientId,actualSenderId];const groupName=memberIds.map(id=>getDisplayName(id,null)).join(', ');const newConversation={id:correctGroupId,type:'group',name:groupName,members:memberIds,owner:memberIds[0],admins:[],avatar:'',userIsObserver:!0,unread:0,pinned:!1,lastActivity:new Date(window.currentGameDate).getTime(),dissolved:!1,nicknames:{}};conversations.push(newConversation);saveData();correctConversation=newConversation}
finalTargetConversationId=correctGroupId;conversation=correctConversation}}}
if(!conversation){const groupMatch=finalTargetConversationId.match(/^convo_group_(.+)$/);if(groupMatch&&!groupMatch[1].includes('user')&&!groupMatch[1].includes('{{user}}')){const memberIds=groupMatch[1].split('-');const groupName=memberIds.map(id=>getDisplayName(id,null)).join(', ');const newConversation={id:finalTargetConversationId,type:'group',name:groupName,members:memberIds,owner:memberIds[0],admins:[],avatar:'',userIsObserver:!0,unread:0,pinned:!1,lastActivity:new Date(window.currentGameDate).getTime(),dissolved:!1,nicknames:{}};conversations.push(newConversation);saveData();conversation=newConversation}else{console.warn(`[BLMX ROUTING] AI tried to reply to a non-existent or invalid conversation '${finalTargetConversationId}'. Ignoring.`);return}}
if(conversation.type==='vgroup'){}else{if(!conversation.members.includes(senderId)){console.warn(`[BLMX ROUTING] AI tried to reply as '${senderId}' to conversation '${finalTargetConversationId}' where they are not a member. Ignoring.`);return}}
if(conversation.muted&&conversation.muted[senderId]&&new Date()<new Date(conversation.muted[senderId]))return;const inviteMatch=value.match(/^\[邀请:(.*)\]/);if(inviteMatch){try{const inviteData=JSON.parse(inviteMatch[1]);const{inviter,invitee}=inviteData;if(conversation&&conversation.type==='group'&&inviter&&invitee){const isUserInvitee=(invitee==='user'||invitee==='{{user}}'||invitee===userProfile.name);const needsAdding=isUserInvitee?conversation.userIsObserver:!conversation.members.includes(invitee);if(needsAdding){let finalInviteeId=invitee;if(isUserInvitee){finalInviteeId='user';conversation.userIsObserver=!1;if(!conversation.members.includes('user')){conversation.members.push('user')}}else{if(!conversation.members.includes(invitee)){conversation.members.push(invitee)}}
const eventData={type:'add',convoId:finalTargetConversationId,author:inviter,targetIds:[finalInviteeId],timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ')};blmxManager.addEntry({type:'group_event',content:eventData});saveData();uiNeedsRefresh=!0;return}}}catch(e){console.error("解析邀请指令失败:",e,inviteMatch[1])}}
const failedMessagePrefix="消息失败--";let isFailedMessage=!1;let finalContent=value;if(value.startsWith(failedMessagePrefix)&&conversation.type==='single'){isFailedMessage=!0;finalContent=value.substring(failedMessagePrefix.length).trim()}
let newEntry={id:`msg-${Date.now()}-${Math.random()}`,sender:senderId,conversationId:finalTargetConversationId,type:'message',content:finalContent,isFailed:isFailedMessage};const inviteListenMatch=value.match(/MUSIC_SHARE:({.*})/);const stickerMatch=value.match(/^\[(表情|sticker):\s*(.*)\]/);const imageMatch=value.match(/^\[(图片|image):\s*(.*)\]/);const voiceMatch=value.match(/^\[(语音|voice):\s*({.*})\]/);const locationMatch=value.match(/^\[(位置|location):\s*(.*)\]/);const transferMatch=value.match(/^\[(转账|transfer):\s*(.*)\]/);const fileMatch=value.match(/^\[(文件|file):\s*(.*)\]/);const giftMatch=value.match(/^\[(礼物|gift):\s*(.*)\]/);const redPacketMatch=value.match(/^\[(红包|red_packet):\s*(.*)\]/);const forwardMatch=value.match(/^\[(转发|forward):\s*(.*)\]/s);let wasPacket=!1;if(inviteListenMatch){newEntry.type='music_share';try{const musicData=JSON.parse(inviteListenMatch[1]);newEntry.data=musicData;newEntry.content=inviteListenMatch[1]}catch(e){console.error("解析 MUSIC_SHARE JSON 失败:",e);newEntry.type='message';newEntry.content=value}}else if(voiceMatch){newEntry.type='voice';newEntry.content=JSON.parse(voiceMatch[2])}else if(stickerMatch){newEntry.type='sticker';newEntry.content=stickerMatch[2]}else if(imageMatch){newEntry.type='image';try{newEntry.content=JSON.parse(imageMatch[2])}catch(e){newEntry.content={type:'desc',value:imageMatch[2]}}
if(newEntry.content&&newEntry.content.type==='desc'&&newEntry.content.value){processEntryWithNAI(newEntry.id,newEntry.content.value,'chat',newEntry.content.ai_prompt);delete newEntry.content.ai_prompt}}else if(locationMatch){newEntry.type='location';newEntry.content=locationMatch[2]}else if(redPacketMatch){wasPacket=!0;newEntry.type='red_packet';newEntry.content=JSON.parse(redPacketMatch[2]);const grabEvents=simulateRedPacketGrab(finalTargetConversationId,senderId,newEntry.content.amount);blmxManager.addEntry(newEntry);grabEvents.forEach(event=>blmxManager.addEntry(event))}else if(transferMatch){newEntry.type='transfer';newEntry.data=JSON.parse(transferMatch[2]);newEntry.content=transferMatch[2]}else if(fileMatch){newEntry.type='file';newEntry.content=fileMatch[2]}else if(giftMatch){newEntry.type='gift';newEntry.data=JSON.parse(giftMatch[2]);newEntry.content=giftMatch[2]}else if(forwardMatch){newEntry.type='forward';const forwardContent=forwardMatch[2];try{newEntry.data=JSON.parse(forwardContent);newEntry.content=forwardContent}catch(e){newEntry.type='message';newEntry.content=value;delete newEntry.data}}
if(!wasPacket){blmxManager.addEntry(newEntry)}
uiNeedsRefresh=!0;const currentTimestamp=new Date(window.currentGameDate).toISOString();updateConversationTimestamp(finalTargetConversationId,currentTimestamp);if(finalTargetConversationId!==currentConversationId||!document.getElementById('wechat-chat-view').classList.contains('active')){if(!conversation.unread)conversation.unread=0;conversation.unread++;if(!newEntry.isFailed){let bannerTitle=conversation.name;let bannerText=newEntry.content;if(conversation.type==='single'){const otherId=conversation.members.find(m=>m!=='user');bannerTitle=getDisplayName(otherId,conversation.id)}else{const senderName=getDisplayName(newEntry.sender,conversation.id);bannerTitle=conversation.name;bannerText=`${senderName}: ${newEntry.content}`}
showBannerNotification(conversation.id,bannerTitle,bannerText)}}}
function simulateRedPacketGrab(convoId,authorId,amount){const convo=conversations.find(c=>c.id===convoId);if(!convo||convo.type!=='group')return[];const membersToGrab=convo.members.filter(id=>id!==authorId&&id!=='user');if(membersToGrab.length===0)return[];let remaining=Math.round(amount*100);let amounts=[];for(let i=0;i<membersToGrab.length-1;i++){const randomAmount=Math.floor(Math.random()*(remaining-(membersToGrab.length-1-i)))+1;amounts.push(randomAmount);remaining-=randomAmount}
amounts.push(remaining);amounts.sort(()=>Math.random()-0.5);let luckiest={name:'',amount:0};amounts.forEach((amtCents,i)=>{const amt=amtCents/100;if(amt>luckiest.amount){luckiest={name:getDisplayName(membersToGrab[i],convoId),amount:amt}}});const nowTimestamp=new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ');const grabEvents=[];amounts.forEach((amtCents,i)=>{const amt=amtCents/100;const grabberName=getDisplayName(membersToGrab[i],convoId);const eventData={type:'red_packet_grab',convoId,author:authorId,grabberName,amount:amt,isLuckiest:grabberName===luckiest.name,timestamp:nowTimestamp};grabEvents.push({type:'group_event',content:eventData})});return grabEvents}
function updateFooterButtonsState(){const hasText=wechatInput.value.trim()!=='';const hasQueuedMessages=userMessageQueue.length>0;const islandText=document.getElementById('island-text');const pokeBtn=document.getElementById('observer-poke-btn');const screenshotBtn=document.getElementById('observer-screenshot-btn');sendBtn.style.display=(hasText||hasQueuedMessages||hasPendingNotifications)?'inline-block':'none';plusBtn.style.display=hasText||isGenerating?'none':'inline-block';if(isGenerating){sendBtn.disabled=!0;sendBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i>';if(islandText)islandText.classList.add('is-generating');if(pokeBtn)pokeBtn.disabled=!0;if(screenshotBtn)screenshotBtn.disabled=!0}else{sendBtn.disabled=!1;sendBtn.innerHTML='<i class="fas fa-paper-plane"></i>';if(islandText)islandText.classList.remove('is-generating');if(pokeBtn)pokeBtn.disabled=!1;if(screenshotBtn)screenshotBtn.disabled=!1}}
function getAvailableStickersForActor(actorId,convoId){let personalStickers=JSON.parse(localStorage.getItem(getCharStickerStorageKey(actorId))||'[]');let groupStickers=[];if(convoId){const convo=conversations.find(c=>c.id===convoId);if(convo&&convo.type==='group'){groupStickers=JSON.parse(localStorage.getItem(getCharStickerStorageKey(convoId))||'[]')}}
const allStickers=[...personalStickers,...groupStickers];const uniqueStickers=allStickers.filter((sticker,index,self)=>index===self.findIndex((s)=>s.label===sticker.label));return uniqueStickers}
function findStickerUrlByName(name){let allStickers=[];allStickers.push(...defaultGlobalStickers,...JSON.parse(localStorage.getItem(GLOBAL_STICKER_STORAGE_KEY)||'[]'));contacts.forEach(contact=>{const personalStickers=JSON.parse(localStorage.getItem(getCharStickerStorageKey(contact.id))||'[]');allStickers.push(...personalStickers)});conversations.forEach(convo=>{if(convo.type==='group'){const groupStickers=JSON.parse(localStorage.getItem(getCharStickerStorageKey(convo.id))||'[]');allStickers.push(...groupStickers)}else if(convo.type==='single'){const otherMemberId=convo.members.find(m=>m!=='user');if(otherMemberId){const personalStickers=JSON.parse(localStorage.getItem(getCharStickerStorageKey(otherMemberId))||'[]');allStickers.push(...personalStickers)}}});const uniqueStickers=allStickers.filter((sticker,index,self)=>sticker.label&&index===self.findIndex((s)=>s.label===sticker.label));const foundSticker=uniqueStickers.find(s=>s.label===name);return foundSticker?foundSticker.url:undefined}
async function updateAvatar(contactId){if(contactId==='user'){const currentUrl=userProfile.avatar||'';const newUrl=await showDialog({mode:'prompt',text:'请输入你的新头像URL:',defaultValue:currentUrl});if(newUrl!==null){userProfile.avatar=newUrl;document.getElementById('me-view-avatar').src=newUrl}}else{const targetObject=contacts.find(c=>c.id===contactId);if(!targetObject)return;const currentUrl=targetObject.avatar||'';const newUrl=await showDialog({mode:'prompt',text:`请输入 ${getDisplayName(targetObject.id, null)} 的新头像URL:`,defaultValue:currentUrl});if(newUrl!==null){targetObject.avatar=newUrl}}
saveData();await showDialog({mode:'alert',text:'头像已更新！'});if(currentConversationId)renderChatHistory(currentConversationId);renderMomentsFeed(currentMomentsAuthorId);renderConversationList()}
async function parseAndAddStickers(inputString,storageKey){if(!inputString)return;const newStickers=[];const parts=inputString.split(',');parts.forEach(part=>{part=part.trim();if(!part)return;const urlMatch=part.match(/https?:\/\/[^\s]+/);if(urlMatch){const url=urlMatch[0];const label=part.substring(0,urlMatch.index).trim();if(label&&url){newStickers.push({label,url})}}});if(newStickers.length>0){const currentStickers=JSON.parse(localStorage.getItem(storageKey)||'[]');const updatedStickers=[...currentStickers,...newStickers];localStorage.setItem(storageKey,JSON.stringify(updatedStickers));await showDialog({mode:'alert',text:`${newStickers.length} 个表情包已添加！`})}else{await showDialog({mode:'alert',text:"未找到有效的表情包格式。请使用 '描述URL, 描述URL' 格式。逗号是英文逗号"})}}
const GLOBAL_STICKER_FEATURES={get:()=>{const customStickers=JSON.parse(localStorage.getItem(GLOBAL_STICKER_STORAGE_KEY)||'[]');const allStickers=[...defaultGlobalStickers,...customStickers];const features=allStickers.map(s=>({label:s.label,icon:s.url,isDefault:defaultGlobalStickers.some(ds=>ds.label===s.label),action:()=>{stageAndDisplayEntry({type:'sticker',sender:'me',content:s.label});togglePanel(null)}}));features.unshift({label:'删除',isAddBtn:!0,action:()=>{toggleStickerDeleteMode(stickerGrid,GLOBAL_STICKER_STORAGE_KEY,GLOBAL_STICKER_FEATURES)}});features.unshift({label:'添加',isAddBtn:!0,action:async()=>{const input=await showDialog({mode:'prompt',text:"批量添加通用表情包 (格式: 描述1URL1,描述2URL2...用英文逗号分隔开):"});await parseAndAddStickers(input,GLOBAL_STICKER_STORAGE_KEY);renderFeatureGrid(stickerGrid,GLOBAL_STICKER_FEATURES.get())}});return features}};const CHAR_STICKER_FEATURES={get:()=>{if(!currentConversationId)return[];const convo=conversations.find(c=>c.id===currentConversationId);if(!convo)return[];let stickersToShow=[];let storageKey;let panelTitle;if(convo.type==='group'){storageKey=getCharStickerStorageKey(convo.id);panelTitle=`"${convo.name}"`;stickersToShow=JSON.parse(localStorage.getItem(storageKey)||'[]')}else{const otherMemberId=convo.members.find(m=>m!=='user');storageKey=getCharStickerStorageKey(otherMemberId);panelTitle=`"${getDisplayName(otherMemberId, convo.id)}"`;stickersToShow=JSON.parse(localStorage.getItem(storageKey)||'[]')}
const features=stickersToShow.map(s=>({label:s.label,icon:s.url,isDefault:!1,action:()=>{stageAndDisplayEntry({type:'sticker',sender:'me',content:s.label});togglePanel(null)}}));features.unshift({label:'删除',isAddBtn:!0,action:()=>{toggleStickerDeleteMode(charStickerGrid,storageKey,CHAR_STICKER_FEATURES)}});features.unshift({label:'添加',isAddBtn:!0,action:async()=>{const input=await showDialog({mode:'prompt',text:`为 ${panelTitle} 批量添加专属表情包 (格式: 描述1URL1,描述2URL2...):`});await parseAndAddStickers(input,storageKey);renderFeatureGrid(charStickerGrid,CHAR_STICKER_FEATURES.get())}});return features}};const PLUS_FEATURES_PAGE1=[{label:'相册',icon:'fas fa-images',action:async()=>{const desc=await showDialog({mode:'prompt',text:'请输入图片描述:'});if(desc!==null&&desc){stageAndDisplayEntry({type:'image',sender:'me',content:{type:'desc',value:desc}});togglePanel(null)}}},{label:'拍摄',icon:'fas fa-camera',action:async()=>{const result=await showMultiInputDialog({title:'记录事件',fields:[{id:'timestamp',label:'事件发生时间',type:'text',defaultValue:new Date(window.currentGameDate).toISOString().slice(0,16).replace('T',' ')},{id:'description',label:'事件描述 (可选)',type:'textarea'}]});if(result===null){return}
const{timestamp,description}=result;if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(timestamp.trim())){await showDialog({mode:'alert',text:'时间格式不正确，应为 YYYY-MM-DD HH:mm'});return}
window.currentGameDate=new Date(timestamp);const eventData={convoId:currentConversationId,timestamp,description:description||""};blmxManager.addEntry({type:'event_log',content:eventData});addEventLogToWeChat(eventData,blmxManager.logEntries.length-1);blmxManager.persistLogToStorage();togglePanel(null)}},{label:'视频通话',icon:'fas fa-video',action:async()=>{if(currentCallState!=='idle'){await showDialog({mode:'alert',text:'当前正在通话中或呼叫中。'});return}
const convo=conversations.find(c=>c.id===currentConversationId);if(!convo||convo.type!=='single'){await showDialog({mode:'alert',text:'只能在和单个联系人的聊天中发起视频通话。'});return}
const otherMemberId=convo.members.find(m=>m!=='user');const contact=contacts.find(c=>c.id===otherMemberId);if(!contact)return;const confirmed=await showDialog({mode:'confirm',text:`确定要向 ${getDisplayName(contact.id, currentConversationId)} 发起视频通话吗？`});if(!confirmed)return;document.getElementById('chat-simulation-log').innerHTML='';currentCallState='calling';callPartner={id:contact.id,name:getDisplayName(contact.id,currentConversationId),avatar:getAvatar(contact.id)};const callingScreen=document.getElementById('calling-screen');callingScreen.querySelector('.caller-avatar').src=callPartner.avatar;callingScreen.querySelector('.caller-name').textContent=callPartner.name;showCallView('calling-screen');togglePanel(null);setTimeout(()=>{if(currentCallState==='calling'){currentCallState='in-call';const inCallScreen=document.getElementById('in-call-screen');const sharedScreen=inCallScreen.querySelector('#call-shared-screen');inCallScreen.style.backgroundImage=`url('${callPartner.avatar}')`;inCallScreen.querySelector('.caller-name').textContent=callPartner.name;sharedScreen.innerHTML='';sharedScreen.style.display='none';showCallView('in-call-screen');startCallTimer()}},Math.random()*1000+3000)}},{label:'位置',icon:'fas fa-map-marker-alt',action:async()=>{const loc=await showDialog({mode:'prompt',text:'请输入位置:'});if(loc!==null&&loc){stageAndDisplayEntry({type:'location',sender:'me',content:loc});togglePanel(null)}}},{label:'红包',icon:'fas fa-envelope-open-text',action:()=>togglePanel('char-sticker')},{label:'转账',icon:'fas fa-exchange-alt',action:async()=>{const result=await showMultiInputDialog({title:'发起转账',fields:[{id:'amount',label:'转账金额 (元)',type:'text'},{id:'note',label:'备注 (可选)',type:'text'}]});if(result===null)return;const{amount:amountStr,note}=result;const amount=parseFloat(amountStr);if(!isNaN(amount)&&amount>0){let transferData={amount:amount.toFixed(2),note:note||' ',status:'sent'};const convo=conversations.find(c=>c.id===currentConversationId);if(convo&&convo.type==='group'){showRecipientSelectionModal('transfer',transferData)}else{const otherMemberId=convo.members.find(m=>m!=='user');transferData.recipientId=otherMemberId;stageAndDisplayEntry({type:'transfer',sender:'me',data:transferData});togglePanel(null)}}else{await showDialog({mode:'alert',text:'请输入有效金额'})}}},{label:'文件',icon:'fas fa-file-alt',action:async()=>{const fileName=await showDialog({mode:'prompt',text:'请输入文件名:'});if(fileName!==null&&fileName){stageAndDisplayEntry({type:'file',sender:'me',content:fileName});togglePanel(null)}}},{label:'礼物',icon:'fas fa-gift',action:async()=>{const result=await showMultiInputDialog({title:'赠送礼物',fields:[{id:'name',label:'礼物名称',type:'text'},{id:'price',label:'价格 (可选)',type:'text'}]});if(result===null)return;const{name,price}=result;if(name.trim()){let giftData={name:name,price:price||'',status:'sent'};const convo=conversations.find(c=>c.id===currentConversationId);if(convo&&convo.type==='group'){showRecipientSelectionModal('gift',giftData)}else{const otherMemberId=convo.members.find(m=>m!=='user');giftData.recipientId=otherMemberId;stageAndDisplayEntry({type:'gift',sender:'me',data:giftData});togglePanel(null)}}else{await showDialog({mode:'alert',text:'礼物名称不能为空。'})}}},];const PLUS_FEATURES_PAGE2=[{label:'群红包',icon:'fas fa-wallet',action:async()=>{const convo=conversations.find(c=>c.id===currentConversationId);if(!convo||convo.type!=='group'){await showDialog({mode:'alert',text:'只能在群聊中发群红包。'});return}
const result=await showMultiInputDialog({title:'发送群红包',fields:[{id:'title',label:'祝福语',type:'text',defaultValue:'恭喜发财，大吉大利'},{id:'amount',label:'总金额 (元)',type:'text'},{id:'timestamp',label:'发送时间',type:'text',defaultValue:new Date(window.currentGameDate).toISOString().slice(0,16).replace('T',' ')}]});if(result===null){return}
const{title,amount:amountStr,timestamp}=result;const amount=parseFloat(amountStr);if(isNaN(amount)||amount<=0){await showDialog({mode:'alert',text:'请输入有效的金额。'});return}
if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(timestamp.trim())){await showDialog({mode:'alert',text:'时间格式不正确，应为 YYYY-MM-DD HH:mm'});return}
const packetData={title:title||'恭喜发财，大吉大利',amount,senderId:userProfile.id,timestamp:timestamp.trim()};const packetEntry={type:'red_packet',sender:'user',content:packetData,conversationId:convo.id,id:`msg-pending-${Date.now()}`};const grabEvents=simulateRedPacketGrab(convo.id,'user',amount);blmxManager.addEntry(packetEntry);grabEvents.forEach(event=>blmxManager.addEntry(event));await blmxManager.persistLogToStorage();renderChatHistory(currentConversationId);togglePanel(null)}},{label:'转发',icon:'fas fa-share-alt',action:()=>{enterForwardMode();togglePanel(null)}},{label:'长截图',icon:'fas fa-camera-retro',action:()=>{takeLongScreenshot();togglePanel(null)}},];function renderPlusPanel(){plusPanel.innerHTML=`
            <div class="features-grid active" id="plus-grid-page1"></div>
            <div class="features-grid" id="plus-grid-page2" style="display:none;"></div>
            <div class="panel-pagination">
                <div class="panel-dot active" data-page="1"></div>
                <div class="panel-dot" data-page="2"></div>
            </div>`;renderFeatureGrid(plusPanel.querySelector('#plus-grid-page1'),PLUS_FEATURES_PAGE1);renderFeatureGrid(plusPanel.querySelector('#plus-grid-page2'),PLUS_FEATURES_PAGE2);plusPanel.querySelectorAll('.panel-dot').forEach(dot=>{dot.addEventListener('click',(e)=>{const page=e.target.dataset.page;plusPanel.querySelectorAll('.features-grid').forEach(grid=>grid.style.display='none');plusPanel.querySelector(`#plus-grid-page${page}`).style.display='grid';plusPanel.querySelectorAll('.panel-dot').forEach(d=>d.classList.remove('active'));e.target.classList.add('active')})})}
function togglePanel(panelToShow){const panelContainer=document.getElementById('panel-container');const currentActivePanel=document.querySelector('.panel-view.active');const isActive=panelContainer.classList.contains('active');if(isActive&&currentActivePanel&&currentActivePanel.id.startsWith(panelToShow)){panelContainer.classList.remove('active');currentActivePanel.classList.remove('active')}else if(panelToShow){if(panelToShow==='char-sticker'){renderFeatureGrid(charStickerGrid,CHAR_STICKER_FEATURES.get())}
if(currentActivePanel)currentActivePanel.classList.remove('active');document.getElementById(`${panelToShow}-panel`).classList.add('active');if(!isActive)panelContainer.classList.add('active');}else{if(isActive)panelContainer.classList.remove('active');if(currentActivePanel)currentActivePanel.classList.remove('active');}}
async function toggleStickerDeleteMode(gridElement,storageKey,featureProvider){const panel=gridElement.closest('.panel-view');const isCurrentlyDeleteMode=gridElement.classList.contains('sticker-delete-mode');const existingConfirmBar=panel.querySelector('.delete-confirm-bar');if(existingConfirmBar){existingConfirmBar.remove()}
if(isCurrentlyDeleteMode){gridElement.classList.remove('sticker-delete-mode');panel.classList.remove('delete-mode-active');renderFeatureGrid(gridElement,featureProvider.get())}else{gridElement.classList.add('sticker-delete-mode');panel.classList.add('delete-mode-active');renderFeatureGrid(gridElement,featureProvider.get());const confirmBar=document.createElement('div');confirmBar.className='delete-confirm-bar';confirmBar.style.cssText='padding: 0.75rem; background: rgba(247,247,247,0.95); display: flex; justify-content: center; align-items: center; gap: 1rem; border-top: 1px solid #E2E2E2;';const confirmButton=document.createElement('button');confirmButton.textContent='确认删除选中项';confirmButton.style.cssText='padding: 0.5rem 1rem; border: none; border-radius: 0.3125rem; background-color: #E53935; color: white; cursor: pointer; font-size: 0.9em;';const cancelButton=document.createElement('button');cancelButton.textContent='取消';cancelButton.style.cssText='padding: 0.5rem 1rem; border: none; border-radius: 0.3125rem; background-color: #757575; color: white; cursor: pointer; font-size: 0.9em;';confirmBar.appendChild(cancelButton);confirmBar.appendChild(confirmButton);panel.appendChild(confirmBar);cancelButton.onclick=()=>{toggleStickerDeleteMode(gridElement,storageKey,featureProvider)};confirmButton.onclick=async()=>{const labelsToDelete=[];gridElement.querySelectorAll('.sticker-checkbox:checked').forEach(cb=>{labelsToDelete.push(cb.dataset.stickerLabel)});if(labelsToDelete.length===0){await showDialog({mode:'alert',text:"请至少选择一个要删除的表情包。"});return}
const confirmed=await showDialog({mode:'confirm',text:`确定要删除选中的 ${labelsToDelete.length} 个表情包吗？`});if(confirmed){const currentStickers=JSON.parse(localStorage.getItem(storageKey)||'[]');const updatedStickers=currentStickers.filter(s=>!labelsToDelete.includes(s.label));localStorage.setItem(storageKey,JSON.stringify(updatedStickers));await showDialog({mode:'alert',text:"删除成功！"});toggleStickerDeleteMode(gridElement,storageKey,featureProvider)}}}}
function renderFeatureGrid(gridElement,features){gridElement.innerHTML='';const isDeleteMode=gridElement.classList.contains('sticker-delete-mode');features.forEach(feature=>{const item=document.createElement('div');item.className='feature-item';let iconHtml;if(feature.isAddBtn){iconHtml=`<div class="feature-icon"><i class="fas fa-${feature.label === '添加' ? 'plus' : 'trash-alt'}"></i></div>`}else if(feature.icon.startsWith('fas ')){iconHtml=`<div class="feature-icon"><i class="${feature.icon}"></i></div>`}else{iconHtml=`<div class="feature-icon"><img src="${feature.icon}" alt="${feature.label}"></div>`}
item.innerHTML=`${iconHtml}<span class="feature-label">${feature.label}</span>`;if(isDeleteMode&&!feature.isAddBtn){const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.className='sticker-checkbox';checkbox.dataset.stickerLabel=feature.label;item.appendChild(checkbox);item.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();checkbox.checked=!checkbox.checked})}else{item.addEventListener('click',feature.action)}
gridElement.appendChild(item)})}
async function promptForTimestamp(promptText,defaultText){const dateTimeInput=await showDialog({mode:'prompt',text:promptText,defaultValue:defaultText.replace(' ','T')});if(dateTimeInput===null){return null}
if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTimeInput)){await showDialog({mode:'alert',text:"格式错误，请输入 YYYY-MM-DDTHH:mm 格式。"});return null}
return dateTimeInput}
function applyCurrentChatWallpaper(){const convo=conversations.find(c=>c.id===currentConversationId);const chatBody=document.querySelector('#wechat-chat-view .wechat-body');if(convo&&convo.wallpaper){applyWallpaper(chatBody,convo.wallpaper,'')}else{chatBody.style.backgroundImage=''}}
function applyWallpaper(viewElement,url,defaultBg){if(url){viewElement.style.backgroundImage=`url("${url}")`;viewElement.style.backgroundColor='transparent'}else{viewElement.style.backgroundImage='none';viewElement.style.backgroundColor=defaultBg||'var(--wechat-bg)'}}
function createWallpaperChangeHandler(storageKey,isPrivate=!1){return async function(e){e.preventDefault();let currentUrl='';let convoId=null;if(isPrivate){convoId=e.currentTarget.dataset.convoId;const convo=conversations.find(c=>c.id===convoId);if(!convo)return;currentUrl=convo.wallpaper||''}else{currentUrl=localStorage.getItem(storageKey)||''}
const newUrl=await showDialog({mode:'prompt',text:'请输入壁纸的URL链接 (留空则恢复默认):',defaultValue:currentUrl});if(newUrl!==null){if(newUrl.trim()===''){if(isPrivate){const convo=conversations.find(c=>c.id===convoId);delete convo.wallpaper}else{localStorage.removeItem(storageKey)}
await showDialog({mode:'alert',text:'壁纸已恢复默认。'})}else{try{new URL(newUrl);if(isPrivate){const convo=conversations.find(c=>c.id===convoId);convo.wallpaper=newUrl}else{localStorage.setItem(storageKey,newUrl)}
await showDialog({mode:'alert',text:'壁纸已更新！'})}catch(_){await showDialog({mode:'alert',text:'请输入一个有效的URL。'})}}
saveData();applyCurrentChatWallpaper()}}}
function renderConversationList(){const listEl=document.getElementById('conversation-list');listEl.innerHTML='';if(!conversations.find(c=>c.id==='moments_feed')){conversations.unshift({id:'moments_feed',type:'system',name:'朋友圈',members:[],unread:0,lastActivity:0,pinned:!1})}
const lastMessageMap=new Map();const allEntries=[...blmxManager.logEntries,...userMessageQueue];allEntries.forEach(entry=>{const convoId=entry.conversationId||entry.convoId||(entry.content&&entry.content.convoId)||(entry.data&&entry.data.convoId);if(convoId&&(entry.type||entry.key)&&!['time'].includes(entry.type)){lastMessageMap.set(convoId,entry)}});const sortedConversations=[...conversations].sort((a,b)=>{const aIsPinned=a.pinned||!1;const bIsPinned=b.pinned||!1;if(aIsPinned!==bIsPinned){return aIsPinned?-1:1}
return(b.lastActivity||0)-(a.lastActivity||0)});if(sortedConversations.length===1&&sortedConversations[0].id==='moments_feed'){listEl.innerHTML='<p style="text-align:center; color:#999; margin-top: 2rem;">还没有聊天，快去添加朋友吧！</p>';return}
sortedConversations.forEach(convo=>{if(convo.dissolved&&!convo.archived)return;const item=document.createElement('div');item.className='conversation-item';item.dataset.conversationId=convo.id;if(convo.pinned){item.classList.add('pinned')}
let avatarSrc,name;if(convo.id==='moments_feed'){avatarSrc=userProfile.cover||'https://files.catbox.moe/bialj8.jpeg';name='朋友圈'}else if(convo.type==='group'){avatarSrc=convo.avatar||'https://files.catbox.moe/bialj8.jpeg';name=`${convo.name} (${convo.members.length})`;if(convo.dissolved)name+=" (已解散)"}else if(convo.type==='vgroup'){avatarSrc=convo.avatar||'https://files.catbox.moe/g3x1v8.jpg';name=convo.name}else{const otherMemberId=convo.members.find(m=>m!=='user');if(otherMemberId){avatarSrc=getAvatar(otherMemberId);name=getDisplayName(otherMemberId,convo.id)}else{avatarSrc='https://files.catbox.moe/bialj8.jpeg';name='未知对话'}}
let lastMessageText='';const lastMessage=lastMessageMap.get(convo.id);if(convo.id==='moments_feed'){const lastInteraction=[...blmxManager.logEntries].reverse().find(e=>{if((e.key==='CHAR_COMMENT')&&e.data.author!=='user'){const allMomentEntries=blmxManager.logEntries.map((me,i)=>({...me,originalIndex:i})).filter(me=>me.key==='MOMENT');const targetPost=allMomentEntries.find(m=>m.data.momentId===e.data.target_post_id);return targetPost&&(targetPost.data.author==='user'||targetPost.data.author==='{{user}}')}
return!1});const lastMomentByOther=[...blmxManager.logEntries].reverse().find(e=>e.key==='MOMENT'&&e.data.author!=='user');if(lastInteraction){const actorName=getDisplayName(lastInteraction.data.author,null);lastMessageText=`[${actorName}] 评论了你的动态`}else if(lastMomentByOther){lastMessageText=`[${getDisplayName(lastMomentByOther.data.author, null)}] 发布了新动态`}else{lastMessageText="还没有新动态"}}else if(lastMessage){const senderId=lastMessage.sender||(lastMessage.data?lastMessage.data.author:'');const senderName=getDisplayName(senderId,convo.id);const prefix=(senderId==='user'||senderId==='{{user}}')?'你: ':(convo.type==='group'||convo.type==='vgroup'?`${senderName}: `:'');switch(lastMessage.type||lastMessage.key){case 'message':lastMessageText=prefix+lastMessage.content;break;case 'forward':lastMessageText=prefix+`[${lastMessage.data.title || '聊天记录'}]`;break;case 'group_event':lastMessageText=`[系统消息] ${getGroupEventDescription(lastMessage.content)}`;break;case 'event_log':lastMessageText=`[系统消息]`;break;case 'image':lastMessageText=prefix+'[图片]';break;case 'voice':lastMessageText=prefix+'[语音]';break;case 'red_packet':lastMessageText=prefix+'[红包] '+lastMessage.content.title;break;default:lastMessageText=prefix+`[${lastMessage.type || lastMessage.key}]`}}
const lastActivityDate=convo.lastActivity?new Date(convo.lastActivity):null;const timeText=lastActivityDate?formatMomentTimestamp(lastActivityDate.toISOString().replace('T',' ')):'';const unreadCount=convo.unread||0;item.innerHTML=`
			<div class="convo-avatar-container">
				<img src="${avatarSrc}" class="convo-avatar">
				${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
			</div>
			<div class="convo-details">
				<div class="convo-top-line">
					<div class="convo-name">${name}</div>
					<div class="convo-time">${timeText}</div>
				</div>
				<div class="convo-last-message">${lastMessageText.substring(0, 30)}</div>
			</div>
		`;item.addEventListener('click',()=>{navigateTo('wechatChat',{conversationId:convo.id})});addLongPressListener(item,(e)=>{showConversationContextMenu(convo.id,e)});listEl.appendChild(item)})}
function renderContactsList(){const container=document.getElementById('contacts-list-container');container.innerHTML='';if(contacts.length===0){container.innerHTML='<p style="text-align:center; color:#999; margin-top: 2rem;">通讯录是空的，快去添加朋友吧！</p>';return}
const sortedContacts=[...contacts].sort((a,b)=>{const nameA=getDisplayName(a.id,null);const nameB=getDisplayName(b.id,null);return nameA.localeCompare(nameB,'zh-Hans-CN',{sensitivity:'accent'})});const groupedContacts=sortedContacts.reduce((groups,contact)=>{const firstLetter='#';if(!groups[firstLetter]){groups[firstLetter]=[]}
groups[firstLetter].push(contact);return groups},{});const flatList=document.createElement('ul');flatList.style.listStyle='none';flatList.style.margin='0';flatList.style.padding='0';sortedContacts.forEach(contact=>{const li=document.createElement('li');li.className='conversation-item';li.dataset.contactId=contact.id;li.innerHTML=`
						<div class="convo-avatar-container">
							<img src="${getAvatar(contact.id)}" class="convo-avatar">
						</div>
						<div class="convo-details" style="display: flex; align-items: center;">
							<div class="convo-name">${getDisplayName(contact.id, null)}</div>
						</div>
					`;flatList.appendChild(li)});container.appendChild(flatList)}
function updateAppBadge(){const totalUnread=conversations.reduce((sum,convo)=>sum+(convo.unread||0),0);const badge=document.getElementById('wechat-app-badge');if(totalUnread>0){badge.textContent=totalUnread>99?'99+':totalUnread;badge.style.display='flex'}else{badge.style.display='none'}}
async function showConversationContextMenu(conversationId,event){const existingMenu=document.querySelector('.context-menu');if(existingMenu)existingMenu.remove();const existingBackdrop=document.querySelector('.context-menu-backdrop');if(existingBackdrop)existingBackdrop.remove();const conversation=conversations.find(c=>c.id===conversationId);if(!conversation)return;const menu=document.createElement('div');menu.className='context-menu';let menuItems='';if(conversation.id!=='moments_feed'){const pinOptionText=conversation.pinned?'取消置顶':'置顶消息';menuItems+=`<div class="context-menu-item" data-action="pin"style="color: var(--text-color-secondary);">${pinOptionText}</div>`}
menuItems+=`<div class="context-menu-item" data-action="read"style="color: var(--text-color-secondary);">标为已读</div>`;if(conversation.userIsObserver||conversation.type!=='system'){menuItems+=`<div class="context-menu-item" data-action="delete" style="color:red;">删除此聊天</div>`}
menu.innerHTML=menuItems;const backdrop=document.createElement('div');backdrop.className='context-menu-backdrop';document.body.appendChild(backdrop);document.body.appendChild(menu);const x=event.type.includes('touch')?event.touches[0].clientX:event.clientX;const y=event.type.includes('touch')?event.touches[0].clientY:event.clientY;menu.style.left=`${x}px`;menu.style.top=`${y}px`;const cleanup=()=>{menu.remove();backdrop.remove()};backdrop.addEventListener('click',cleanup);menu.addEventListener('click',async(e)=>{const action=e.target.dataset.action;if(action==='pin'){conversation.pinned=!conversation.pinned}else if(action==='read'){conversation.unread=0}else if(action==='delete'){const confirmed=await showDialog({mode:'confirm',text:'确定要删除这个聊天吗？\n此操作不可恢复。'});if(confirmed){const convoIndex=conversations.findIndex(c=>c.id===conversationId);if(convoIndex>-1)conversations.splice(convoIndex,1);blmxManager.logEntries=blmxManager.logEntries.filter(entry=>(entry.conversationId||entry.convoId||(entry.content&&entry.content.convoId)||(entry.data&&entry.data.convoId))!==conversationId);await blmxManager.persistLogToStorage()}}
saveData();renderConversationList();updateAppBadge();cleanup()})}
async function showGroupMemberContextMenu(memberId,convoId,event){const existingMenu=document.querySelector('.context-menu');if(existingMenu)existingMenu.remove();const existingBackdrop=document.querySelector('.context-menu-backdrop');if(existingBackdrop)existingBackdrop.remove();const conversation=conversations.find(c=>c.id===convoId);if(!conversation)return;const actorId='user';const menu=document.createElement('div');menu.className='context-menu';let menuItems='';const actorIsOwner=conversation.owner===actorId;const actorIsAdmin=conversation.admins&&conversation.admins.includes(actorId);const targetIsOwner=conversation.owner===memberId;const targetIsAdmin=conversation.admins&&conversation.admins.includes(memberId);const targetIsMuted=conversation.muted&&conversation.muted[memberId]&&new Date()<new Date(conversation.muted[memberId]);menuItems+=`<div class="context-menu-item" data-action="nickname">修改群昵称</div>`;if(actorIsOwner||actorIsAdmin){if(!targetIsOwner&&!(actorIsAdmin&&targetIsAdmin&&!actorIsOwner)){if(targetIsMuted){menuItems+=`<div class="context-menu-item" data-action="unmute">解除禁言</div>`}else{menuItems+=`<div class="context-menu-item" data-action="mute">禁言</div>`}}}
if(actorIsOwner&&!targetIsOwner){if(targetIsAdmin){menuItems+=`<div class="context-menu-item" data-action="unset_admin">取消管理员</div>`}else{menuItems+=`<div class="context-menu-item" data-action="set_admin">设为管理员</div>`}}
if(actorIsOwner||actorIsAdmin){if(!targetIsOwner&&!(actorIsAdmin&&targetIsAdmin&&!actorIsOwner)){menuItems+=`<div class="context-menu-item" data-action="kick" style="color:red;">移出群聊</div>`}}
menu.innerHTML=menuItems;if(!menu.hasChildNodes()){return}
const backdrop=document.createElement('div');backdrop.className='context-menu-backdrop';document.body.appendChild(backdrop);document.body.appendChild(menu);const x=event.type.includes('touch')?event.touches[0].clientX:event.clientX;const y=event.type.includes('touch')?event.touches[0].clientY:event.clientY;menu.style.left=`${x}px`;menu.style.top=`${y}px`;const cleanup=()=>{menu.remove();backdrop.remove()};backdrop.addEventListener('click',cleanup);menu.addEventListener('click',async(e)=>{const action=e.target.dataset.action;if(!action)return;cleanup();const nowTimestamp=new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ');let eventData={convoId:convoId,author:actorId,targetId:memberId,timestamp:nowTimestamp};let shouldLog=!1;switch(action){case 'nickname':{const oldName=getDisplayName(memberId,convoId);const newNickname=await showDialog({mode:'prompt',text:`为 "${oldName}" 设置群昵称:`,defaultValue:oldName});if(newNickname!==null){if(!conversation.nicknames)conversation.nicknames={};conversation.nicknames[memberId]=newNickname.trim();eventData.type='nickname_change';eventData.oldName=oldName;eventData.newName=newNickname.trim();shouldLog=!0}
break}
case 'mute':{const durationStr=await showDialog({mode:'prompt',text:'输入禁言时长（分钟）:',defaultValue:'10'});const duration=parseInt(durationStr,10);if(!isNaN(duration)&&duration>0){if(!conversation.muted)conversation.muted={};conversation.muted[memberId]=new Date(new Date(nowTimestamp.replace(' ','T')).getTime()+duration*60000).toISOString();eventData.type='mute';eventData.duration=duration;shouldLog=!0}else if(durationStr!==null){await showDialog({mode:'alert',text:'请输入有效的禁言时长。'})}
break}
case 'unmute':{delete conversation.muted[memberId];eventData.type='unmute';shouldLog=!0;break}
case 'set_admin':{if(!conversation.admins)conversation.admins=[];if(!conversation.admins.includes(memberId))conversation.admins.push(memberId);eventData.type='set_admin';shouldLog=!0;break}
case 'unset_admin':{conversation.admins=conversation.admins.filter(id=>id!==memberId);eventData.type='unset_admin';shouldLog=!0;break}
case 'kick':{const confirmed=await showDialog({mode:'confirm',text:`确定要将 "${getDisplayName(memberId, convoId)}" 移出群聊吗？`});if(confirmed){conversation.members=conversation.members.filter(id=>id!==memberId);eventData.type='kick';shouldLog=!0}
break}}
if(shouldLog){blmxManager.addEntry({type:'group_event',content:eventData});await blmxManager.persistLogToStorage();saveData();navigateTo('groupSettings',{conversationId:convoId})}})}
function assignConversationsToLogEntries(){blmxManager.logEntries.forEach(entry=>{if(entry.conversationId||entry.convoId){return}
if(!entry.sender)return;const sender=entry.sender;if(sender==='user')return;const potentialConvos=conversations.filter(c=>c.members.includes(sender));if(potentialConvos.length===1){entry.conversationId=potentialConvos[0].id}else if(potentialConvos.length>1){const singleChat=potentialConvos.find(c=>c.type==='single');entry.conversationId=singleChat?singleChat.id:potentialConvos[0].id}else{console.warn(`[BLMX History] Could not find a conversation for old log entry from sender '${sender}'.`)}});console.log("[BLMX] Finished assigning conversations to historical logs.")}
async function handleSoftReset(){const confirmed=await showDialog({mode:'confirm',text:'【软重置】\n确定要清空所有聊天记录、朋友圈、微博、日记以及查手机记录吗？\n\n此操作不可撤销，但会保留您的联系人和设置。'});if(confirmed){blmxManager.logEntries=[];weiboData={posts:[],comments:{},likes:{}};await blmxManager.persistLogToStorage();conversations.forEach(convo=>{convo.unread=0;convo.lastActivity=0});saveData();Object.keys(localStorage).forEach(key=>{if(key.startsWith('blmx_footprints_')||key.startsWith('blmx_shopping_')||key.startsWith('blmx_browser_')||key.startsWith('blmx_gallery_')){localStorage.removeItem(key);console.log(`[Soft Reset] Cleared cache: ${key}`)}});renderConversationList();updateAppBadge();const footprintsList=document.getElementById('cp-footprints-list');if(footprintsList)footprintsList.innerHTML='';await showDialog({mode:'alert',text:'软重置完成！所有动态数据已被清空。'});navigateTo('home')}}
async function handleHardReset(){const confirmed=await showDialog({mode:'confirm',text:'【硬重置 - 警告！】\n确定要将手机恢复到出厂设置吗？\n\n此操作将删除所有聊天记录、联系人、群聊、设置、壁纸等全部数据，且不可恢复！'});if(confirmed){await showDialog({mode:'alert',text:'正在清除所有数据...'});blmxManager.logEntries=[];await blmxManager.persistLogToStorage();const keysToRemove=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith('blmx_')){keysToRemove.push(key)}}
keysToRemove.forEach(key=>{localStorage.removeItem(key);console.log(`[Hard Reset] Removed: ${key}`)});await showDialog({mode:'alert',text:'数据已全部清除。手机即将重启。'});location.reload()}}
function getMomentsInteractionContextForAI(momentId,userActionText){const postEntry=blmxManager.logEntries.find(e=>e.key==='MOMENT'&&e.data.momentId===momentId);if(!postEntry){console.error(`[AI Moments] 无法创建上下文，未找到ID为 ${momentId} 的朋友圈。`);return null}
const post=postEntry.data;const postAuthorName=getDisplayName(post.author,null);let context=`[任务: 朋友圈互动导演]\n你正在扮演除 {{user}} 之外的所有角色。你的任务是根据上下文，自然地推进评论区的对话。\n\n`;context+=`--- 朋友圈原文 ---\n`;context+=`发布者: ${postAuthorName}\n`;context+=`内容: ${post.text || '(无文字内容)'}\n\n`;const interactions=blmxManager.logEntries.filter(e=>(e.key==='CHAR_COMMENT')&&e.data.target_post_id===momentId);if(interactions.length>0){context+=`--- 已有互动 ---\n`;interactions.forEach(inter=>{const interAuthor=getDisplayName(inter.data.author,null);context+=`${interAuthor} 评论: ${inter.data.text}\n`});context+=`\n`}
context+=`--- 最新互动 ---\n`;if(userActionText){context+=`{{user}} 刚刚评论说: "${userActionText}"\n\n`}else{context+=`{{user}} 刚刚点赞了这条动态。\n\n`}
context+=`--- 你的任务 ---\n让一两个角色对**最新的互动**（无论是来自{{user}}还是其他角色）做出回应。你的回应必须符合角色人设。\n\n`;context+=`【评论格式新规 (CRITICAL)】\n`;context+=`1. **禁止引用**: 朋友圈评论中，绝对禁止使用 \`[引用:"..."]\` 格式。\n`;context+=`2. **回复他人**: 如果你想回复评论区的某个人（非作者），请使用 \`@对方名字:\` 的格式开头。\n`;context+=` * 示例: \`@李四: 我同意你的看法。\`\n`;context+=`3. **回复作者/普通评论**: 如果你是回复作者，或者只是发表普通评论，直接写内容即可。\n`;context+=` * 示例: \`这条动态太有意思了。\`\n\n`;context+=`[输出格式]\n你的回复必须严格使用以下指令格式，每条指令占一行，不要包含任何其他文字：\n`;context+=`CHAR_COMMENT:{"author":"角色ID","text":"评论内容","target_post_id":"${momentId}"}`;return context}
async function triggerAiMomentsResponse(momentId,userActionText){if(isGenerating)return;console.log(`[AI Moments] 正在为朋友圈 ${momentId} 的互动触发AI响应...`);isGenerating=!0;updateFooterButtonsState();const contextForAI=getMomentsInteractionContextForAI(momentId,userActionText);if(!contextForAI){isGenerating=!1;updateFooterButtonsState();return}
latestPromptSentToAI=contextForAI;try{const rawResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1,});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){await parseAndHandleAiResponse(latestAiRawResponse)}}catch(error){console.error(`[AI Moments] AI响应失败:`,error);await showDialog({mode:'alert',text:`AI响应朋友圈失败: ${error.message}`})}finally{isGenerating=!1;updateFooterButtonsState()}}
async function handleDeleteMoment(momentId){const confirmed=await showDialog({mode:'confirm',text:'确定要删除这条朋友圈吗？\n此操作将同时删除所有相关的点赞和评论，且不可恢复。'});if(!confirmed){return}
blmxManager.logEntries=blmxManager.logEntries.filter(entry=>{if(entry.key==='MOMENT'&&entry.data.momentId===momentId){return!1}
if((entry.key==='CHAR_LIKE'||entry.key==='CHAR_COMMENT')&&entry.data.target_post_id===momentId){return!1}
return!0});await blmxManager.persistLogToStorage();renderMomentsFeed(currentMomentsAuthorId);await showDialog({mode:'alert',text:'动态已删除。'})}
async function handleBlockContact(contactId){const contact=contacts.find(c=>c.id===contactId);if(!contact){console.error(`[Block Contact] Action failed: Cannot find contact with id: ${contactId}`);return}
const isCurrentlyBlocked=contact.isBlocked||!1;const actionText=isCurrentlyBlocked?'解除拉黑':'加入黑名单';const confirmText=isCurrentlyBlocked?`确定要将 "${getDisplayName(contact.id, null)}" 从黑名单中移除吗？`:`确定要将 "${getDisplayName(contact.id, null)}" 加入黑名单吗？`;const confirmed=await showDialog({mode:'confirm',text:confirmText});if(confirmed){const wasBlocked=contact.isBlocked;contact.isBlocked=!isCurrentlyBlocked;saveData();renderContactDetails(contactId);if(!wasBlocked&&contact.isBlocked){await showDialog({mode:'alert',text:`正在通知 ${getDisplayName(contact.id, null)}...`});await notifyAiOfBlock(contactId)}
await showDialog({mode:'alert',text:`已成功${actionText}。`})}}
async function notifyAiOfBlock(contactId){if(isGenerating)return;const contact=contacts.find(c=>c.id===contactId);if(!contact)return;const notificationPrompt=`[SYSTEM NOTIFICATION: YOU HAVE BEEN BLOCKED]
You are roleplaying as ${getDisplayName(contact.id, null)} (ID: ${contact.id}).
You have just been blocked by {{user}}.
You are now compelled to react to this event.

**Your Action:**
You MUST respond with one or more messages directed at {{user}}.
Each message MUST start with the prefix "消息失败--".
This prefix indicates that your message was sent but failed to deliver because you are blocked.

**Example Response:**
[convo_single_${contact.id}] ${contact.id}: 消息失败--你把我拉黑了？
[convo_single_${contact.id}] ${contact.id}: 消息失败--胆子不小。

Your response should only be the action messages. Do not add any other text. Please begin your response now.`;isGenerating=!0;updateFooterButtonsState();latestPromptSentToAI=notificationPrompt;try{const rawResponse=await tavernGenerateFunc({user_input:notificationPrompt,should_stream:!1});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){const responseLines=latestAiRawResponse.split('\n').filter(line=>line.trim());const responseRegex=/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/;for(const line of responseLines){const chatMatch=line.match(responseRegex);if(chatMatch){const targetConversationId=chatMatch[1];const senderId=chatMatch[2].trim();const value=chatMatch[3];handleAiChatMessage(value,senderId,targetConversationId)}}
if(Views.wechatChat.classList.contains('active')){renderChatHistory(currentConversationId)}
renderConversationList();updateAppBadge();await blmxManager.persistLogToStorage();saveData()}}catch(error){console.error("[BLMX Notify AI] Failed to notify AI of block:",error);await showDialog({mode:'alert',text:'通知AI失败，详情请查看控制台。'})}finally{isGenerating=!1;updateFooterButtonsState()}}
function renderThemeEditor(){const container=document.getElementById('studio-body');if(!container)return;let colorControlsContainer=container.querySelector('#color-controls-wrapper');if(colorControlsContainer){colorControlsContainer.innerHTML=''}else{colorControlsContainer=document.createElement('div');colorControlsContainer.id='color-controls-wrapper';container.appendChild(colorControlsContainer)}
const rootStyles=getComputedStyle(document.documentElement);const groupedVariables={};for(const variableName in globalThemeVariableMap){const info=globalThemeVariableMap[variableName];if(!groupedVariables[info.group]){groupedVariables[info.group]=[]}
groupedVariables[info.group].push({name:variableName,...info})}
globalThemeGroupOrder.forEach(groupName=>{if(groupedVariables[groupName]){const groupContainer=document.createElement('div');groupContainer.className='studio-color-group';const groupTitle=document.createElement('h4');groupTitle.textContent=groupName;groupContainer.appendChild(groupTitle);groupedVariables[groupName].forEach(variable=>{const currentValueRaw=rootStyles.getPropertyValue(variable.name).trim();const item=document.createElement('div');item.className='studio-color-item';if(variable.type==='range'){const currentValueNumber=parseFloat(currentValueRaw)||variable.min;item.innerHTML=`
<span class="label">${variable.label}</span>
<div class="studio-color-controls">
    <input type="range" 
           data-variable="${variable.name}" 
           min="${variable.min}" 
           max="${variable.max}" 
           step="${variable.step || 1}" 
           value="${currentValueNumber}" 
           style="width: 8rem; cursor: pointer; vertical-align: middle;">
    <span class="range-value" style="font-size: 0.85em; width: 3.5rem; text-align: right; color: var(--text-color-secondary); font-family: monospace;">
        ${currentValueNumber}${variable.unit}
    </span>
</div>
`}else if(variable.type==='imageUrl'){const urlMatch=currentValueRaw.match(/url\(['"]?([^'"]+)['"]?\)/);const imageUrl=urlMatch?urlMatch[1]:'';item.innerHTML=`
<span class="label">${variable.label}</span>
<div class="studio-color-controls">
	<input type="text" class="hex-input" value="${imageUrl}" data-variable="${variable.name}" data-type="imageUrl" placeholder="粘贴图片链接..." style="width: 12rem; text-align: left; font-family: sans-serif; flex-grow: 1;">
</div>
`}else{let hex8Value;if(currentValueRaw.startsWith('#')){hex8Value=currentValueRaw.length===7?currentValueRaw+'ff':currentValueRaw}else{hex8Value=rgbaToHex8(currentValueRaw)}
const hex6Value='#'+hex8Value.substring(1,7);item.innerHTML=`
<span class="label">${variable.label}</span>
<div class="studio-color-controls">
	<input type="text" class="hex-input" value="${hex8Value}" data-variable="${variable.name}" maxlength="9">
	<div class="color-input-wrapper">
		<input type="color" data-variable-picker-for="${variable.name}" value="${hex6Value}">
		<div class="color-preview" style="background: ${currentValueRaw};"></div>
	</div>
</div>
`}
groupContainer.appendChild(item)});colorControlsContainer.appendChild(groupContainer)}})}
function applySavedTheme(){const savedThemeJSON=localStorage.getItem(`blmx_global_theme_${currentCharId}`);if(savedThemeJSON){try{const savedTheme=JSON.parse(savedThemeJSON);for(const variableName in savedTheme){let valueToApply=savedTheme[variableName];const config=globalThemeVariableMap[variableName];if(config&&config.type==='range'&&config.unit){if(valueToApply&&!isNaN(parseFloat(valueToApply))&&!String(valueToApply).endsWith(config.unit)){valueToApply+=config.unit}}
if(config&&config.type==='imageUrl'){valueToApply=valueToApply?`url('${valueToApply}')`:'none'}else if(valueToApply.startsWith('#')){const rgbaObj=hexToRgba(valueToApply);if(rgbaObj){valueToApply=`rgba(${rgbaObj.r}, ${rgbaObj.g}, ${rgbaObj.b}, ${rgbaObj.a})`}}
document.documentElement.style.setProperty(variableName,valueToApply)}
console.log('[BLMX Theme] Successfully applied saved global theme (with auto-fix).')}catch(e){console.error('[BLMX Theme] Failed to parse or apply saved theme:',e)}}}
function renderBubblePreview(){const previewArea=document.getElementById('bubble-preview-area');if(!previewArea)return;previewArea.innerHTML='';previewArea.style.background='';previewArea.style.padding='1rem';previewArea.style.borderRadius='0.5rem';const previewContainer=document.createElement('div');previewContainer.style.cssText=`
display: flex;
flex-direction: column;
gap: 1rem;
`;const themRow=document.createElement('div');themRow.className='message-row them';themRow.innerHTML=`
<img src="https://files.catbox.moe/bialj8.jpeg" class="message-avatar">
<div class="message-content-wrapper">
	<div class="message-bubble" id="preview-bubble-them">这是角色的消息预览</div>
</div>
`;const meRow=document.createElement('div');meRow.className='message-row me';meRow.innerHTML=`
<div class="message-content-wrapper">
	<div class="message-bubble" id="preview-bubble-me">这是用户的消息预览</div>
</div>
<img src="${getAvatar('user')}" class="message-avatar">
`;previewContainer.appendChild(themRow);previewContainer.appendChild(meRow);previewArea.appendChild(previewContainer);const workshopView=document.getElementById('bubble-workshop-view');const previewAreaStyle=document.createElement('style');previewAreaStyle.textContent=`
#bubble-workshop-view #bubble-preview-area {
background-color: var(--view-bg-primary);
}
`;if(!workshopView.querySelector('style')){workshopView.prepend(previewAreaStyle)}}
function renderBubbleWorkshopControls(){const controlsContainer=document.getElementById('bubble-controls-container');if(!controlsContainer)return;controlsContainer.innerHTML='';const mainControlsGroup=document.createElement('div');mainControlsGroup.className='studio-control-group';mainControlsGroup.innerHTML=`
		<h4>基础设置</h4>
		<div class="studio-control-row">
			<label class="label" style="font-size: 0.9em; font-weight: 500;">编辑目标</label>
			<div id="bubble-target-selector" class="control-wrapper">
				<input type="radio" id="target-me" name="bubble-target" value="me" checked>
				<label for="target-me" style="font-size: 0.9em;">我的气泡</label>
				<input type="radio" id="target-them" name="bubble-target" value="them" style="margin-left: 0.5rem;">
				<label for="target-them" style="font-size: 0.9em;">对方气泡</label>
			</div>
		</div>
		<div class="studio-control-row">
			<label class="label" style="font-size: 0.9em; font-weight: 500;">同步操作</label>
			<div class="control-wrapper" style="flex-grow: 1; display: flex; gap: 0.75rem; justify-content: flex-end;">
				<button id="sync-me-to-them-btn" class="studio-btn studio-btn-sync" style="background-color: var(--phone-frame-bg); color: var(--text-color-secondary);">同步对方</button>
				<button id="sync-them-to-me-btn" class="studio-btn studio-btn-sync" style="background-color: var(--phone-frame-bg); color: var(--text-color-secondary);">同步至我</button>
			</div>
		</div>
	`;controlsContainer.appendChild(mainControlsGroup);const createCollapsibleGroup=(title,contentHtml,isActive=!1)=>{const group=document.createElement('div');group.className=`studio-control-group collapsible ${isActive ? 'active' : ''}`;group.innerHTML=`
				<div class="collapsible-header">
					<h4>${title}</h4>
					<i class="fas fa-chevron-down chevron-icon"></i>
				</div>
				<div class="collapsible-content">
					${contentHtml}
				</div>
			`;return group};const backgroundContent=`
		<div class="studio-control-row">
			<label class="label">背景类型</label>
			<div id="bubble-bg-type-selector" class="control-wrapper">
				<input type="radio" id="bg-type-color" name="bg-type" value="color" checked>
				<label for="bg-type-color" style="font-size: 0.9em;">纯色/渐变</label>
				<input type="radio" id="bg-type-image" name="bg-type" value="image" style="margin-left: 0.5rem;">
				<label for="bg-type-image" style="font-size: 0.9em;">图片</label>
			</div>
		</div>
		<div id="bubble-bg-color-controls">
			<div class="studio-control-row">
				<label class="label">颜色 1</label>
				<div class="control-wrapper">
					<input type="text" class="hex-input" data-variable="bg-color-1">
					<div class="color-input-wrapper">
						<input type="color" data-variable="bg-color-1">
						<div class="color-preview"></div>
					</div>
				</div>
			</div>
			<div class="studio-control-row">
				<label class="label">颜色 2</label>
				<div class="control-wrapper">
					<input type="text" class="hex-input" data-variable="bg-color-2" placeholder="设为同色=纯色">
					<div class="color-input-wrapper">
						<input type="color" data-variable="bg-color-2">
						<div class="color-preview"></div>
					</div>
				</div>
			</div>
			<div class="studio-control-row">
				<label class="label">渐变角度</label>
				<div class="control-wrapper">
					<input type="range" data-variable="bg-gradient-angle" min="0" max="360" step="1" data-unit="deg" style="width: 6rem;">
					<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
				</div>
			</div>
		</div>
		<div id="bubble-bg-image-controls" style="display: none;">
			<div class="studio-control-row">
				<label class="label">图片 URL</label>
				<input type="text" data-variable="bg-image-url" placeholder="粘贴图片链接..." style="flex-grow:1;">
			</div>
		</div>
		
		<!-- [核心新增] 磨砂玻璃模糊度滑块 -->
		<div class="studio-control-row">
			<label class="label">磨砂模糊度 (Blur)</label>
			<div class="control-wrapper">
				<input type="range" data-variable="backdrop-blur" min="0" max="20" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
	`;controlsContainer.appendChild(createCollapsibleGroup('背景 (Background)',backgroundContent));const shapeContent=`
		<div class="studio-control-row">
			<label class="label">统一圆角</label>
			<div class="control-wrapper">
				<input type="range" data-variable="border-radius-all" min="0" max="50" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
		<div class="studio-control-row">
			<label class="label">左上圆角</label>
			<div class="control-wrapper">
				<input type="range" data-variable="border-top-left-radius" min="0" max="50" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
		<div class="studio-control-row">
			<label class="label">右上圆角</label>
			<div class="control-wrapper">
				<input type="range" data-variable="border-top-right-radius" min="0" max="50" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
		<div class="studio-control-row">
			<label class="label">右下圆角</label>
			<div class="control-wrapper">
				<input type="range" data-variable="border-bottom-right-radius" min="0" max="50" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
		<div class="studio-control-row">
			<label class="label">左下圆角</label>
			<div class="control-wrapper">
				<input type="range" data-variable="border-bottom-left-radius" min="0" max="50" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
	`;controlsContainer.appendChild(createCollapsibleGroup('形状 (Shape)',shapeContent));const typographyContent=`
		<div class="studio-control-row">
			<label class="label">字体颜色</label>
			<div class="control-wrapper">
				<input type="text" class="hex-input" data-variable="text-color">
				<div class="color-input-wrapper">
					<input type="color" data-variable="text-color">
					<div class="color-preview"></div>
				</div>
			</div>
		</div>
		<div class="studio-control-row">
			<label class="label">字体大小</label>
			<div class="control-wrapper">
				<input type="range" data-variable="font-size" min="10" max="24" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
		<div class="studio-control-row">
			<label class="label">字体粗细</label>
			<div class="control-wrapper">
				<input type="range" data-variable="font-weight" min="100" max="900" step="100" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
	`;controlsContainer.appendChild(createCollapsibleGroup('字体 (Typography)',typographyContent));const borderContent=`
		<div class="studio-control-row">
			<label class="label">边框粗细</label>
			<div class="control-wrapper">
				<input type="range" data-variable="border-width" min="0" max="10" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
		<div class="studio-control-row">
			<label class="label">边框样式</label>
			<select data-variable="border-style">
				<option value="solid">实线 (Solid)</option>
				<option value="dashed">虚线 (Dashed)</option>
				<option value="dotted">点状 (Dotted)</option>
			</select>
		</div>
		<div class="studio-control-row">
			<label class="label">边框颜色</label>
			<div class="control-wrapper">
				<input type="text" class="hex-input" data-variable="border-color">
				<div class="color-input-wrapper">
					<input type="color" data-variable="border-color">
					<div class="color-preview"></div>
				</div>
			</div>
		</div>
	`;controlsContainer.appendChild(createCollapsibleGroup('边框 (Border)',borderContent));const handDrawnContent=`
<div class="studio-control-row">
	<label class="label">铅笔扭曲度</label>
	<div class="control-wrapper">
<input type="range" data-variable="wiggle-scale" min="0" max="10" step="0.5" value="0" style="width: 6rem;">
		<span class="range-value" style="width: 3.5rem; text-align: right;">0</span>
	</div>
</div>
<div class="studio-control-row">
	<p style="font-size:0.75em; color:var(--text-color-tertiary); margin:0;">提示：配合“形状”里的不同圆角值可实现不规则形状</p>
</div>
`;controlsContainer.appendChild(createCollapsibleGroup('手绘风格 (Sketch)',handDrawnContent));const shadowContent=`
<div class="studio-control-row">
	<label class="label">水平偏移</label>
	<div class="control-wrapper">
		<input type="range" data-variable="shadow-offset-x" min="-20" max="20" step="1" data-unit="px" style="width: 6rem;">
		<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
	</div>
</div>
<div class="studio-control-row">
	<label class="label">垂直偏移</label>
	<div class="control-wrapper">
		<input type="range" data-variable="shadow-offset-y" min="-20" max="20" step="1" data-unit="px" style="width: 6rem;">
		<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
	</div>
</div>
<div class="studio-control-row">
	<label class="label">模糊半径</label>
	<div class="control-wrapper">
		<input type="range" data-variable="shadow-blur" min="0" max="40" step="1" data-unit="px" style="width: 6rem;">
		<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
	</div>
</div>
<div class="studio-control-row">
	<label class="label">扩展半径</label>
	<div class="control-wrapper">
		<input type="range" data-variable="shadow-spread" min="-20" max="20" step="1" data-unit="px" style="width: 6rem;">
		<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
	</div>
</div>
<div class="studio-control-row">
	<label class="label">阴影颜色</label>
	<div class="control-wrapper">
		<input type="text" class="hex-input" data-variable="shadow-color" maxlength="9">
		<div class="color-input-wrapper">
			<input type="color" data-variable="shadow-color">
			<div class="color-preview"></div>
		</div>
	</div>
</div>
<div class="studio-control-row">
	<label class="label">内阴影</label>
	<div class="control-wrapper">
		<input type="checkbox" data-variable="shadow-inset">
	</div>
</div>
`;controlsContainer.appendChild(createCollapsibleGroup('阴影 (Shadow)',shadowContent));const spacingContent=`
		<div class="studio-control-row">
			<label class="label">内边距 (上/下)</label>
			<div class="control-wrapper">
				<input type="range" data-variable="padding-vertical" min="0" max="30" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
		<div class="studio-control-row">
			<label class="label">内边距 (左/右)</label>
			<div class="control-wrapper">
				<input type="range" data-variable="padding-horizontal" min="0" max="30" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
		<div class="studio-control-row">
			<label class="label">外边距 (上/下)</label>
			<div class="control-wrapper">
				<input type="range" data-variable="margin-vertical" min="0" max="30" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
		<div class="studio-control-row">
			<label class="label">外边距 (左/右)</label>
			<div class="control-wrapper">
				<input type="range" data-variable="margin-horizontal" min="0" max="30" step="0.5" data-unit="px" style="width: 6rem;">
				<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
			</div>
		</div>
	`;controlsContainer.appendChild(createCollapsibleGroup('间距 (Spacing)',spacingContent));let decoContent='';['1','2'].forEach(i=>{decoContent+=`
<h5 style="margin-top:1.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--divider-color-secondary); padding-bottom: 0.5rem; color: var(--text-color-primary);">装饰层 ${i}</h5>

<!-- 类型选择 -->
<div class="studio-control-row">
	<label class="label">类型</label>
	<div class="control-wrapper deco-type-selector" data-layer="${i}">
		<label><input type="radio" name="deco-${i}-type" value="image" checked> 图片</label>
		<label style="margin-left:0.5rem;"><input type="radio" name="deco-${i}-type" value="text"> 字符/形状</label>
	</div>
</div>

<!-- 图片模式控件 (包含 URL、宽度、高度) -->
<div id="deco-${i}-image-group" class="deco-group-image">
	<div class="studio-control-row">
		<label class="label">图片 URL</label>
		<input type="text" data-variable="deco-${i}-url" placeholder="粘贴链接..." style="flex-grow:1;">
	</div>
	<div class="studio-control-row">
		<label class="label">宽度</label>
		<div class="control-wrapper">
			<input type="range" data-variable="deco-${i}-width" min="0" max="200" step="1" data-unit="px" style="width: 6rem;">
			<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
		</div>
	</div>
	<div class="studio-control-row">
		<label class="label">高度</label>
		<div class="control-wrapper">
			<input type="range" data-variable="deco-${i}-height" min="0" max="200" step="1" data-unit="px" style="width: 6rem;">
			<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
		</div>
	</div>
</div>

<!-- 字符模式控件 -->
<div id="deco-${i}-text-group" class="deco-group-text" style="display:none;">
	<div class="studio-control-row">
		<label class="label">内容 (Content)</label>
		<input type="text" data-variable="deco-${i}-content" placeholder="填入 ▲ 或 文字" style="width: 8rem; text-align:center;">
	</div>
	<div class="studio-control-row">
		<label class="label">字体大小</label>
		<div class="control-wrapper">
			<input type="range" data-variable="deco-${i}-font-size" min="10" max="100" step="1" data-unit="px" style="width: 6rem;">
			<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
		</div>
	</div>
	<div class="studio-control-row">
		<label class="label">颜色</label>
		<div class="control-wrapper">
			<input type="text" class="hex-input" data-variable="deco-${i}-color">
			<div class="color-input-wrapper">
				<input type="color" data-variable="deco-${i}-color">
				<div class="color-preview"></div>
			</div>
		</div>
	</div>
</div>

<!-- 通用位置与变换 -->
<div class="studio-control-row">
	<label class="label">旋转角度</label>
	<div class="control-wrapper">
		<input type="range" data-variable="deco-${i}-rotate" min="0" max="360" step="1" data-unit="deg" style="width: 6rem;">
		<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
	</div>
</div>

<!-- 快速位置微调 -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1rem; font-size: 0.9em; margin-top: 0.5rem; background: rgba(0,0,0,0.03); padding: 0.5rem; border-radius: 4px;">
	<div style="display: flex; align-items: center; justify-content: space-between;"><label>Top:</label><input type="text" data-variable="deco-${i}-top" style="width: 4rem;" placeholder="auto"></div>
	<div style="display: flex; align-items: center; justify-content: space-between;"><label>Right:</label><input type="text" data-variable="deco-${i}-right" style="width: 4rem;" placeholder="auto"></div>
	<div style="display: flex; align-items: center; justify-content: space-between;"><label>Bottom:</label><input type="text" data-variable="deco-${i}-bottom" style="width: 4rem;" placeholder="auto"></div>
	<div style="display: flex; align-items: center; justify-content: space-between;"><label>Left:</label><input type="text" data-variable="deco-${i}-left" style="width: 4rem;" placeholder="auto"></div>
</div>
`});controlsContainer.appendChild(createCollapsibleGroup('装饰 (Decorations)',decoContent,!1))}
function handleBubbleControlChange(e){const targetElement=e.target;const currentTarget=document.querySelector('input[name="bubble-target"]:checked').value;const getControlValue=(variable)=>{const control=document.querySelector(`[data-variable="${variable}"]`);if(!control)return null;return control.type==='checkbox'?control.checked:control.value};const updateBubbleStyles=()=>{const target=currentTarget;const root=document.documentElement;const bgType=document.querySelector('input[name="bg-type"]:checked').value;let finalBackgroundValue;const rawImageUrl=getControlValue('bg-image-url');const color1=getControlValue('bg-color-1');const color2=getControlValue('bg-color-2');const angle=getControlValue('bg-gradient-angle');root.style.setProperty(`--bubble-${target}-bg-mode`,bgType);root.style.setProperty(`--bubble-${target}-bg-url`,rawImageUrl);root.style.setProperty(`--bubble-${target}-backdrop-blur`,getControlValue('backdrop-blur')+'px');if(targetElement.id==='bubble-wiggle-slider'){const scaleValue=targetElement.value;document.getElementById('wiggle-map').setAttribute('scale',scaleValue);if(targetElement.nextElementSibling){targetElement.nextElementSibling.textContent=scaleValue}}
if(bgType==='image'){const imagePart=rawImageUrl?`url('${rawImageUrl}') center center / cover no-repeat`:'none';finalBackgroundValue=`${imagePart}, transparent`;root.style.setProperty(`--bubble-${target}-bg-image`,rawImageUrl?`url('${rawImageUrl}')`:'none');root.style.setProperty(`--bubble-${target}-bg-color`,'transparent')}else{let colorPart=(color1===color2)?color1:`linear-gradient(${angle}deg, ${color1}, ${color2})`;finalBackgroundValue=`none, ${colorPart}`;root.style.setProperty(`--bubble-${target}-bg-image`,'none');root.style.setProperty(`--bubble-${target}-bg-color`,colorPart)}
root.style.setProperty(`--bubble-${target}-background`,finalBackgroundValue);root.style.setProperty(`--bubble-${target}-border-top-left-radius`,getControlValue('border-top-left-radius')+'px');root.style.setProperty(`--bubble-${target}-border-top-right-radius`,getControlValue('border-top-right-radius')+'px');root.style.setProperty(`--bubble-${target}-border-bottom-right-radius`,getControlValue('border-bottom-right-radius')+'px');root.style.setProperty(`--bubble-${target}-border-bottom-left-radius`,getControlValue('border-bottom-left-radius')+'px');root.style.setProperty(`--bubble-${target}-text-color`,getControlValue('text-color'));root.style.setProperty(`--bubble-${target}-font-size`,getControlValue('font-size')+'px');root.style.setProperty(`--bubble-${target}-font-weight`,getControlValue('font-weight'));root.style.setProperty(`--bubble-${target}-border-width`,getControlValue('border-width')+'px');root.style.setProperty(`--bubble-${target}-border-style`,getControlValue('border-style'));root.style.setProperty(`--bubble-${target}-border-color`,getControlValue('border-color'));const shadowValue=`${getControlValue('shadow-inset') ? 'inset' : ''} ${getControlValue('shadow-offset-x')}px ${getControlValue('shadow-offset-y')}px ${getControlValue('shadow-blur')}px ${getControlValue('shadow-spread')}px ${getControlValue('shadow-color')}`.trim();root.style.setProperty(`--bubble-${target}-box-shadow`,shadowValue);root.style.setProperty(`--bubble-${target}-padding-top`,getControlValue('padding-vertical')+'px');root.style.setProperty(`--bubble-${target}-padding-bottom`,getControlValue('padding-vertical')+'px');root.style.setProperty(`--bubble-${target}-padding-left`,getControlValue('padding-horizontal')+'px');root.style.setProperty(`--bubble-${target}-padding-right`,getControlValue('padding-horizontal')+'px');root.style.setProperty(`--bubble-${target}-margin-top`,getControlValue('margin-vertical')+'px');root.style.setProperty(`--bubble-${target}-margin-bottom`,getControlValue('margin-vertical')+'px');root.style.setProperty(`--bubble-${target}-margin-left`,getControlValue('margin-horizontal')+'px');root.style.setProperty(`--bubble-${target}-margin-right`,getControlValue('margin-horizontal')+'px');['deco-1','deco-2'].forEach(decoName=>{const i=decoName.split('-')[1];const modeRadio=document.querySelector(`input[name="deco-${i}-type"]:checked`);const mode=modeRadio?modeRadio.value:'image';const imgGroup=document.getElementById(`deco-${i}-image-group`);const textGroup=document.getElementById(`deco-${i}-text-group`);if(imgGroup&&textGroup){imgGroup.style.display=(mode==='image')?'block':'none';textGroup.style.display=(mode==='text')?'block':'none'}
const urlInput=document.querySelector(`[data-variable="${decoName}-url"]`);const contentInput=document.querySelector(`[data-variable="${decoName}-content"]`);const urlVar=`--bubble-${target}-${decoName}-url`;const contentVar=`--bubble-${target}-${decoName}-content`;if(mode==='image'){const urlVal=urlInput?urlInput.value.trim():'';root.style.setProperty(urlVar,urlVal?`url('${urlVal}')`:'none');root.style.setProperty(contentVar,'""')}else{root.style.setProperty(urlVar,'none');const rawContent=contentInput?contentInput.value:'';root.style.setProperty(contentVar,`"${rawContent}"`)}
const rotateVal=getControlValue(`${decoName}-rotate`);root.style.setProperty(`--bubble-${target}-${decoName}-rotate`,`${rotateVal}deg`);const fontSizeVal=getControlValue(`${decoName}-font-size`);root.style.setProperty(`--bubble-${target}-${decoName}-font-size`,`${fontSizeVal}px`);const colorVal=getControlValue(`${decoName}-color`);root.style.setProperty(`--bubble-${target}-${decoName}-color`,colorVal);['width','height'].forEach(sliderName=>{const sliderVar=`--bubble-${target}-${decoName}-${sliderName}`;const sliderValue=getControlValue(`${decoName}-${sliderName}`);const sliderEl=document.querySelector(`[data-variable="${decoName}-${sliderName}"]`);if(sliderEl){const unit=sliderEl.dataset.unit||'';root.style.setProperty(sliderVar,`${sliderValue}${unit}`)}});const wiggleVal=getControlValue('wiggle-scale');root.style.setProperty(`--bubble-${target}-wiggle-scale`,wiggleVal);const wiggleMap=document.getElementById('wiggle-map');if(wiggleMap){wiggleMap.setAttribute('scale',wiggleVal)}['top','right','bottom','left'].forEach(posName=>{const posVar=`--bubble-${target}-${decoName}-${posName}`;const posValue=getControlValue(`${decoName}-${posName}`);root.style.setProperty(posVar,posValue)})})};if(targetElement.type==='range'&&targetElement.nextElementSibling){const unit=targetElement.dataset.unit||'';targetElement.nextElementSibling.textContent=`${targetElement.value}${unit}`}
if(targetElement.type==='color'||(targetElement.classList.contains('hex-input')&&targetElement.dataset.variable!=='bg-image-url')){const wrapper=targetElement.closest('.control-wrapper');if(wrapper){const hexInput=wrapper.querySelector('.hex-input');const colorInput=wrapper.querySelector('input[type="color"]');const previewBox=wrapper.querySelector('.color-preview');if(hexInput)hexInput.value=targetElement.value;if(colorInput)colorInput.value=targetElement.value;if(previewBox)previewBox.style.backgroundColor=targetElement.value}}
if(targetElement.name==='bg-type'){document.getElementById('bubble-bg-color-controls').style.display=(targetElement.value==='color')?'block':'none';document.getElementById('bubble-bg-image-controls').style.display=(targetElement.value==='image')?'block':'none'}
updateBubbleStyles();if(targetElement.dataset.variable==='border-radius-all'){const masterValue=targetElement.value;const individualRadiusVars=['border-top-left-radius','border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius'];individualRadiusVars.forEach(varName=>{const slider=document.querySelector(`[data-variable="${varName}"]`);if(slider){slider.value=masterValue;if(slider.nextElementSibling)slider.nextElementSibling.textContent=`${masterValue}px`}});updateBubbleStyles()}}
function getBubbleStylesAsObject(target){const styleVariables=['background','bg-image','bg-image-size','bg-image-repeat','border-top-left-radius','border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius','text-color','font-size','font-weight','font-family','border-width','border-style','border-color','box-shadow','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-right','margin-bottom','margin-left','wiggle-scale'];const styles={};const rootStyles=getComputedStyle(document.documentElement);styleVariables.forEach(suffix=>{const varName=`--bubble-${target}-${suffix}`;const value=rootStyles.getPropertyValue(varName).trim();if(value){styles[varName]=value}});return styles}
function applyBubbleStylesFromObject(stylesObject,destinationTarget){const sourceTarget=Object.keys(stylesObject)[0].includes('-me-')?'me':'them';for(const sourceVarName in stylesObject){const value=stylesObject[sourceVarName];const destinationVarName=sourceVarName.replace(`--bubble-${sourceTarget}-`,`--bubble-${destinationTarget}-`);document.documentElement.style.setProperty(destinationVarName,value)}}
function saveBubbleStyles(){const styleVariables=['bg-mode','bg-url','backdrop-blur','wiggle-scale','background','bg-image','bg-image-size','bg-image-repeat','border-top-left-radius','border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius','text-color','font-size','font-weight','font-family','border-width','border-style','border-color','box-shadow','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-right','margin-bottom','margin-left','deco-1-url','deco-1-content','deco-1-rotate','deco-1-font-size','deco-1-color','deco-1-width','deco-1-height','deco-1-top','deco-1-right','deco-1-bottom','deco-1-left','deco-1-z-index','deco-2-url','deco-2-content','deco-2-rotate','deco-2-font-size','deco-2-color','deco-2-width','deco-2-height','deco-2-top','deco-2-right','deco-2-bottom','deco-2-left','deco-2-z-index'];const targets=['me','them'];const savedTheme={};targets.forEach(target=>{savedTheme[target]={};styleVariables.forEach(variableSuffix=>{const variableName=`--bubble-${target}-${variableSuffix}`;const value=getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();if(value!==""){savedTheme[target][variableName]=value}})});const storageKey=`blmx_bubble_theme_${currentCharId}`;try{localStorage.setItem(storageKey,JSON.stringify(savedTheme));console.log(`[Bubble Workshop] Styles saved successfully to key: ${storageKey}`,savedTheme);return!0}catch(error){console.error("[Bubble Workshop] Failed to save styles to localStorage:",error);return!1}}
function loadBubbleStyles(){const currentTarget=document.querySelector('input[name="bubble-target"]:checked').value;const controlsContainer=document.getElementById('bubble-controls-container');if(!controlsContainer)return;const allControls=controlsContainer.querySelectorAll('[data-variable]');const rootStyles=getComputedStyle(document.documentElement);const updateSlider=(varSuffix,value)=>{const slider=controlsContainer.querySelector(`[data-variable="${varSuffix}"]`);if(slider){slider.value=value;if(slider.nextElementSibling){slider.nextElementSibling.textContent=`${value}${slider.dataset.unit || ''}`}}};const updateColorControls=(varSuffix,colorValue)=>{if(varSuffix.includes('shadow'))return;const hexInput=document.querySelector(`.hex-input[data-variable="${varSuffix}"]`);const colorInput=document.querySelector(`input[type="color"][data-variable="${varSuffix}"]`);if(hexInput)hexInput.value=colorValue;if(colorInput)colorInput.value=colorValue;if(colorInput&&colorInput.nextElementSibling){colorInput.nextElementSibling.style.backgroundColor=colorValue}};const bgMode=rootStyles.getPropertyValue(`--bubble-${currentTarget}-bg-mode`).trim();let rawBgUrl=rootStyles.getPropertyValue(`--bubble-${currentTarget}-bg-url`).trim();if((rawBgUrl.startsWith('"')&&rawBgUrl.endsWith('"'))||(rawBgUrl.startsWith("'")&&rawBgUrl.endsWith("'"))){rawBgUrl=rawBgUrl.slice(1,-1)}
const colorRadio=document.getElementById('bg-type-color');const imageRadio=document.getElementById('bg-type-image');const bgUrlInput=document.querySelector('[data-variable="bg-image-url"]');if(bgMode==='image'){imageRadio.checked=!0;document.getElementById('bubble-bg-color-controls').style.display='none';document.getElementById('bubble-bg-image-controls').style.display='block';if(bgUrlInput)bgUrlInput.value=rawBgUrl}else{colorRadio.checked=!0;document.getElementById('bubble-bg-color-controls').style.display='block';document.getElementById('bubble-bg-image-controls').style.display='none';const backgroundVar=rootStyles.getPropertyValue(`--bubble-${currentTarget}-background`).trim();const gradientMatch=backgroundVar.match(/linear-gradient\((.*?)deg,\s*(.*?),\s*(.*?)\)/);if(gradientMatch){updateSlider('bg-gradient-angle',parseFloat(gradientMatch[1])||0);updateColorControls('bg-color-1',gradientMatch[2].trim());updateColorControls('bg-color-2',gradientMatch[3].trim())}else if(backgroundVar){const solidColor=backgroundVar.split(',').pop().trim();if(solidColor&&!solidColor.includes('url')){updateColorControls('bg-color-1',solidColor);updateColorControls('bg-color-2',solidColor)}}}
const blurValue=parseFloat(rootStyles.getPropertyValue(`--bubble-${currentTarget}-backdrop-blur`).trim())||0;updateSlider('backdrop-blur',blurValue);allControls.forEach(control=>{const varSuffix=control.dataset.variable;if(varSuffix.includes('padding-')||varSuffix.includes('margin-')||varSuffix.includes('shadow-')||varSuffix.includes('bg-')||varSuffix.includes('border-radius')||varSuffix.includes('deco-')||varSuffix==='backdrop-blur')return;const varName=`--bubble-${currentTarget}-${varSuffix}`;const currentValue=rootStyles.getPropertyValue(varName).trim();if(control.type==='range'){updateSlider(varSuffix,parseFloat(currentValue)||0)}else if(control.type==='color'){updateColorControls(varSuffix,currentValue)}else{control.value=currentValue}});updateSlider('border-top-left-radius',parseFloat(rootStyles.getPropertyValue(`--bubble-${currentTarget}-border-top-left-radius`).trim())||0);updateSlider('border-top-right-radius',parseFloat(rootStyles.getPropertyValue(`--bubble-${currentTarget}-border-top-right-radius`).trim())||0);updateSlider('border-bottom-right-radius',parseFloat(rootStyles.getPropertyValue(`--bubble-${currentTarget}-border-bottom-right-radius`).trim())||0);updateSlider('border-bottom-left-radius',parseFloat(rootStyles.getPropertyValue(`--bubble-${currentTarget}-border-bottom-left-radius`).trim())||0);updateSlider('border-radius-all',parseFloat(rootStyles.getPropertyValue(`--bubble-${currentTarget}-border-top-left-radius`).trim())||0);updateSlider('padding-vertical',parseFloat(rootStyles.getPropertyValue(`--bubble-${currentTarget}-padding-top`).trim())||0);updateSlider('padding-horizontal',parseFloat(rootStyles.getPropertyValue(`--bubble-${currentTarget}-padding-left`).trim())||0);updateSlider('margin-vertical',parseFloat(rootStyles.getPropertyValue(`--bubble-${currentTarget}-margin-top`).trim())||0);updateSlider('margin-horizontal',parseFloat(rootStyles.getPropertyValue(`--bubble-${currentTarget}-margin-left`).trim())||0);const shadowValue=rootStyles.getPropertyValue(`--bubble-${currentTarget}-box-shadow`).trim();if(shadowValue&&shadowValue!=='none'){document.querySelector('[data-variable="shadow-inset"]').checked=shadowValue.includes('inset');let partsStr=shadowValue.replace('inset','').trim();const colorMatch=partsStr.match(/(rgba?\(.*?\)|#([0-9a-fA-F]{3,8})|[a-zA-Z]+)\s*$/);let colorString='rgba(0, 0, 0, 0)';if(colorMatch){colorString=colorMatch[0];partsStr=partsStr.substring(0,colorMatch.index).trim()}
const shadowParts=partsStr.split(/\s+/).map(p=>parseFloat(p)||0);updateSlider('shadow-offset-x',shadowParts[0]||0);updateSlider('shadow-offset-y',shadowParts[1]||0);updateSlider('shadow-blur',shadowParts[2]||0);updateSlider('shadow-spread',shadowParts[3]||0);let hex8Value;if(colorString.startsWith('#')){hex8Value=colorString.length===7?colorString+'ff':colorString}else{hex8Value=rgbaToHex8(colorString)}
const hex6Value='#'+hex8Value.substring(1,7);const hexInput=document.querySelector('.hex-input[data-variable="shadow-color"]');const colorInput=document.querySelector('input[type="color"][data-variable="shadow-color"]');const previewBox=colorInput?colorInput.closest('.color-input-wrapper').querySelector('.color-preview'):null;if(hexInput)hexInput.value=hex8Value;if(colorInput)colorInput.value=hex6Value;if(previewBox)previewBox.style.backgroundColor=colorString}['deco-1','deco-2'].forEach(decoName=>{const i=decoName.split('-')[1];const urlVarName=`--bubble-${currentTarget}-${decoName}-url`;const urlValueRaw=rootStyles.getPropertyValue(urlVarName).trim();const urlMatch=urlValueRaw.match(/url\(['"]?(.*?)['"]?\)/);const url=urlMatch?urlMatch[1]:'';const urlInput=controlsContainer.querySelector(`[data-variable="${decoName}-url"]`);if(urlInput)urlInput.value=url;const contentVarName=`--bubble-${currentTarget}-${decoName}-content`;let contentVal=rootStyles.getPropertyValue(contentVarName).trim();if((contentVal.startsWith('"')&&contentVal.endsWith('"'))||(contentVal.startsWith("'")&&contentVal.endsWith("'"))){contentVal=contentVal.slice(1,-1)}
const contentInput=controlsContainer.querySelector(`[data-variable="${decoName}-content"]`);if(contentInput)contentInput.value=contentVal;const isTextMode=contentVal!=="";const typeRadios=document.querySelectorAll(`input[name="deco-${i}-type"]`);if(typeRadios.length>0){if(isTextMode){typeRadios[1].checked=!0;document.getElementById(`deco-${i}-image-group`).style.display='none';document.getElementById(`deco-${i}-text-group`).style.display='block'}else{typeRadios[0].checked=!0;document.getElementById(`deco-${i}-image-group`).style.display='block';document.getElementById(`deco-${i}-text-group`).style.display='none'}}
updateColorControls(`${decoName}-color`,rootStyles.getPropertyValue(`--bubble-${currentTarget}-${decoName}-color`).trim());['width','height','z-index','rotate','font-size'].forEach(sliderName=>{const varName=`--bubble-${currentTarget}-${decoName}-${sliderName}`;const value=parseFloat(rootStyles.getPropertyValue(varName).trim())||0;updateSlider(`${decoName}-${sliderName}`,value)});['top','right','bottom','left'].forEach(posName=>{const varName=`--bubble-${currentTarget}-${decoName}-${posName}`;const value=rootStyles.getPropertyValue(varName).trim();const posInput=controlsContainer.querySelector(`[data-variable="${decoName}-${posName}"]`);if(posInput)posInput.value=value})});const savedWiggle=rootStyles.getPropertyValue(`--bubble-${currentTarget}-wiggle-scale`).trim()||0;updateSlider('wiggle-scale',parseFloat(savedWiggle));const wiggleMap=document.getElementById('wiggle-map');if(wiggleMap)wiggleMap.setAttribute('scale',savedWiggle);}
function applySavedBubbleTheme(){const storageKey=`blmx_bubble_theme_${currentCharId}`;const savedThemeJSON=localStorage.getItem(storageKey);if(!savedThemeJSON){return}
try{const savedTheme=JSON.parse(savedThemeJSON);for(const target in savedTheme){for(const variableName in savedTheme[target]){const value=savedTheme[target][variableName];document.documentElement.style.setProperty(variableName,value);if(variableName.includes('wiggle-scale')){const target=variableName.includes('-me-')?'me':'them';const mapEl=document.getElementById(`wiggle-map-${target}`);if(mapEl)mapEl.setAttribute('scale',value);}}}
console.log(`[Bubble Workshop] Initial theme applied successfully from key: ${storageKey}`)}catch(error){console.error("[Bubble Workshop] Failed to apply saved theme on startup:",error)}}
async function exportTheme(){const defaultFilename=`BLMX_Theme_${currentCharId}_${new Date().toISOString().slice(0,10)}.json`;let finalFilename=await showDialog({mode:'prompt',text:'请输入导出的主题文件名:',defaultValue:defaultFilename});if(finalFilename===null){console.log('[Theme Manager] Export cancelled by user.');return}
finalFilename=finalFilename.trim();if(!finalFilename){await showDialog({mode:'alert',text:'文件名不能为空！'});return}
if(!finalFilename.toLowerCase().endsWith('.json')){finalFilename+='.json'}
const globalThemeKey=`blmx_global_theme_${currentCharId}`;const bubbleThemeKey=`blmx_bubble_theme_${currentCharId}`;const globalThemeJSON=localStorage.getItem(globalThemeKey);const bubbleThemeJSON=localStorage.getItem(bubbleThemeKey);const globalTheme=globalThemeJSON?JSON.parse(globalThemeJSON):{};const bubbleTheme=bubbleThemeJSON?JSON.parse(bubbleThemeJSON):{};const combinedTheme={meta:{name:`BLMX手机主题 - ${currentCharId}`,version:'2.0',exportedAt:new Date().toISOString()},globalTheme:globalTheme,bubbleTheme:bubbleTheme,};const themeString=JSON.stringify(combinedTheme,null,2);const blob=new Blob([themeString],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=finalFilename;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);console.log(`[Theme Manager] Unified theme exported successfully as '${finalFilename}'.`)}
function importTheme(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=(event)=>{const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=async(e)=>{try{const content=e.target.result;const importedTheme=JSON.parse(content);if(!importedTheme.meta||!importedTheme.globalTheme||!importedTheme.bubbleTheme){throw new Error('无效的主题文件格式。')}
const confirmed=await showDialog({mode:'confirm',text:`确定要导入主题 "${importedTheme.meta.name || '未知主题'}" 吗？\n\n这将覆盖您当前所有的设计，包括全局壁纸！`});if(confirmed){const globalThemeKey=`blmx_global_theme_${currentCharId}`;const bubbleThemeKey=`blmx_bubble_theme_${currentCharId}`;localStorage.setItem(globalThemeKey,JSON.stringify(importedTheme.globalTheme));localStorage.setItem(bubbleThemeKey,JSON.stringify(importedTheme.bubbleTheme));await showDialog({mode:'alert',text:'主题导入成功！应用即将刷新以应用所有新设置。'});location.reload()}}catch(error){console.error('[Theme Manager] Failed to import theme:',error);await showDialog({mode:'alert',text:`导入失败：${error.message}`})}};reader.readAsText(file)};input.click()}
const FONT_STYLE_TAG_ID='blmx-custom-font-style';const FONT_STORAGE_KEY=`blmx_custom_font_css_${currentCharId}`;async function applyAndSaveCustomFont(){const input=document.getElementById('font-css-input');const cssCode=input.value.trim();if(!cssCode){await showDialog({mode:'alert',text:'请输入有效的 CSS 代码。'});return}
localStorage.setItem(FONT_STORAGE_KEY,cssCode);applyCssCode(cssCode);await showDialog({mode:'alert',text:'新字体已成功应用并保存！'})}
async function resetDefaultFont(){const confirmed=await showDialog({mode:'confirm',text:'确定要恢复为手机的默认字体吗？\n您保存的自定义字体设置将被清除。'});if(confirmed){localStorage.removeItem(FONT_STORAGE_KEY);const styleTag=document.getElementById(FONT_STYLE_TAG_ID);if(styleTag){styleTag.remove()}
document.documentElement.style.setProperty('--custom-font-family',"'寒蝉全圆体'");document.getElementById('font-css-input').value='';await showDialog({mode:'alert',text:'已恢复为默认字体。'})}}
function loadSavedFontOnStartup(){const savedCss=localStorage.getItem(FONT_STORAGE_KEY);if(savedCss){document.getElementById('font-css-input').value=savedCss;applyCssCode(savedCss);console.log('[BLMX Font Studio] Successfully applied saved custom font on startup.')}}
function applyCssCode(cssCode){let styleTag=document.getElementById(FONT_STYLE_TAG_ID);if(!styleTag){styleTag=document.createElement('style');styleTag.id=FONT_STYLE_TAG_ID;document.head.appendChild(styleTag)}
styleTag.textContent=cssCode;const fontFamilyRegex=/font-family:\s*(.*?)\s*;/;const fontFamilyMatch=cssCode.match(fontFamilyRegex);if(fontFamilyMatch&&fontFamilyMatch[1]){const fontName=fontFamilyMatch[1];document.documentElement.style.setProperty('--custom-font-family',fontName);console.log(`[Font Studio] Applied font: ${fontName}`)}else{const faceMatch=cssCode.match(/@font-face\s*{[^}]*font-family:\s*['"]?([^'";]+)['"]?/);if(faceMatch&&faceMatch[1]){const extractedName=`'${faceMatch[1]}'`;document.documentElement.style.setProperty('--custom-font-family',extractedName);console.log(`[Font Studio] Extracted font-face name: ${extractedName}`)}else{document.documentElement.style.removeProperty('--custom-font-family')}}}
function showQuoteContextMenu(messageRow,event){const existingMenu=document.querySelector('.context-menu');if(existingMenu)existingMenu.remove();const existingBackdrop=document.querySelector('.context-menu-backdrop');if(existingBackdrop)existingBackdrop.remove();const bubble=messageRow.querySelector('.message-bubble');const avatar=messageRow.querySelector('.message-avatar');if(!bubble||!avatar)return;const senderId=avatar.dataset.senderId;let messageContent='';if(bubble.classList.contains('sticker-bubble')){messageContent=`[表情]`}else if(bubble.classList.contains('image-url-bubble')){messageContent='[图片]'}else if(bubble.classList.contains('voice-bubble')){messageContent='[语音]'}else{const replyTextSpan=bubble.querySelector('.reply-text');if(replyTextSpan){messageContent=replyTextSpan.textContent.trim()}else{messageContent=bubble.textContent.trim()}}
if(!senderId||!messageContent)return;const authorName=getDisplayName(senderId,currentConversationId);const menu=document.createElement('div');menu.className='context-menu';menu.innerHTML=`<div class="context-menu-item" data-action="quote">引用</div>`;const backdrop=document.createElement('div');backdrop.className='context-menu-backdrop';document.body.appendChild(backdrop);document.body.appendChild(menu);const x=event.type.includes('touch')?event.touches[0].clientX:event.clientX;const y=event.type.includes('touch')?event.touches[0].clientY:event.clientY;menu.style.left=`${x}px`;menu.style.top=`${y}px`;const cleanup=()=>{menu.remove();backdrop.remove()};backdrop.addEventListener('click',cleanup);menu.addEventListener('click',(e)=>{if(e.target.dataset.action==='quote'){const quoteText=`[引用: "${authorName}: ${messageContent}"] `;wechatInput.value=quoteText;wechatInput.focus();wechatInput.setSelectionRange(wechatInput.value.length,wechatInput.value.length)}
cleanup()})}
function getAnonymousIdentity(){const storageKey=`blmx_weibo_anonymous_identity_${currentCharId}`;const rawData=localStorage.getItem(storageKey);if(rawData){try{return JSON.parse(rawData)}catch(e){console.error("解析“马甲”身份信息失败:",e);return null}}
return null}
function saveAnonymousIdentity(identity){const storageKey=`blmx_weibo_anonymous_identity_${currentCharId}`;try{const dataToStore=JSON.stringify(identity);localStorage.setItem(storageKey,dataToStore)}catch(e){console.error("保存“马甲”身份信息失败:",e)}}
async function handleEditSongInfo(){const result=await showMultiInputDialog({title:'配置歌曲信息',fields:[{id:'title',label:'歌名',type:'text',defaultValue:currentSong.title},{id:'artist',label:'歌手',type:'text',defaultValue:currentSong.artist},{id:'src',label:'MP3 直链 URL',type:'text',defaultValue:currentSong.src},{id:'lrc',label:'LRC 歌词文本',type:'textarea',defaultValue:currentSong.lrc}]});if(result===null)return;if(!result.src.trim()){await showDialog({mode:'alert',text:'MP3 链接不能为空！'});return}
currentSong={title:result.title.trim()||'未知歌曲',artist:result.artist.trim()||'未知歌手',src:result.src.trim(),lrc:result.lrc||''};localStorage.setItem(`blmx_current_song_${currentCharId}`,JSON.stringify(currentSong));document.getElementById('lt-song-title').textContent=currentSong.title;document.getElementById('lt-artist-name').textContent=currentSong.artist;globalAudio.pause();globalAudio.src=currentSong.src;document.getElementById('lt-play-pause-btn').className='fas fa-play-circle';document.getElementById('lt-vinyl').classList.remove('playing');document.getElementById('lt-vinyl-view').classList.remove('playing');console.log("[Lyrics] Reloading lyrics...");parseLyrics(currentSong.lrc);renderLyrics();await showDialog({mode:'alert',text:'歌曲信息已更新！点击播放即可收听。'})}
function showFloatingBubble(text,isMe){const layer=document.getElementById('lt-chat-float-layer');if(!layer)return;const now=new Date();const timeStr=`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;currentMusicSessionLogs.push({sender:isMe?'me':'them',text:text,time:timeStr});const historyView=document.getElementById('lt-history-view');if(historyView&&historyView.classList.contains('active')){renderListenTogetherHistory()}
const bubble=document.createElement('div');bubble.className=`lt-float-bubble ${isMe ? 'me' : 'them'}`;bubble.innerHTML=`
<div class="float-content">
	<span class="float-text">${text}</span>
</div>
`;layer.appendChild(bubble);setTimeout(()=>{bubble.style.transition='opacity 1s ease, transform 1s ease';bubble.style.opacity='0';bubble.style.transform='translateY(-20px)';setTimeout(()=>bubble.remove(),1000)},5000)}
function getListenTogetherContext(userInput){const partner=contacts.find(c=>c.id===currentListenPartnerId);const partnerName=partner?getDisplayName(partner.id,null):'TA';const recentHistory=currentMusicSessionLogs.slice(-20).map(log=>{const speaker=log.sender==='me'?'{{user}}':partnerName;return `${speaker}: ${log.text}`}).join('\n');let lyricsContext="(暂无歌词或纯音乐)";if(parsedLyrics&&parsedLyrics.length>0){lyricsContext=parsedLyrics.map(l=>l.text).join('\n')}else if(currentSong.lrc){lyricsContext=currentSong.lrc}
return `
[任务: 音乐陪伴模式]
你现在是**${partnerName}**，正在和{{user}}一起听歌。
当前播放歌曲: 《${currentSong.title}》 - ${currentSong.artist}。

**[整首歌曲歌词]**:
\`\`\`
${lyricsContext}
\`\`\`

**[此前的对话记录]**:
${recentHistory}

**要求**:
1. 请以${partnerName}的口吻，承接上文的对话记录和正在听的歌曲进行回复。
2. **非常简短**: 回复不要超过20个字，像是在听歌时随口说的一句话。
3. **沉浸感**: 不要打招呼，直接回应。禁止使用任何动作描写。

**输出格式**:
直接输出回复内容，不要任何前缀，不要带引号。
`.trim()}
async function handleListenTogetherSend(){const input=document.getElementById('lt-chat-input');const text=input.value.trim();if(!text)return;document.getElementById('lt-input-overlay').style.display='none';input.value='';showFloatingBubble(text,!0);if(isGenerating)return;isGenerating=!0;try{const context=getListenTogetherContext(text);latestPromptSentToAI=context;const response=await tavernGenerateFunc({user_input:context,should_stream:!1});latestAiRawResponse=response;if(response&&response.trim()){const cleanText=response.trim().replace(/^['"]|['"]$/g,'');showFloatingBubble(cleanText,!1)}}catch(e){console.error("AI Music Chat Failed:",e);showFloatingBubble("...",!1)}finally{isGenerating=!1}}
function renderListenTogetherHistory(){const container=document.getElementById('lt-history-list');if(!container)return;container.innerHTML='';if(currentMusicSessionLogs.length===0){container.innerHTML='<p style="text-align:center; color:rgba(255,255,255,0.3); margin-top:2rem; font-size:0.8em;">暂无聊天记录</p>';return}
currentMusicSessionLogs.forEach(log=>{const item=document.createElement('div');item.className=`lt-history-item ${log.sender}`;let name='';if(log.sender==='me'){name='我'}else{const partner=contacts.find(c=>c.id===currentListenPartnerId);name=partner?(partner.remark||partner.name):'TA'}
item.innerHTML=`
<div class="lt-history-meta">${name} ${log.time}</div>
<div class="lt-history-bubble">${log.text}</div>
`;container.appendChild(item)});setTimeout(()=>{container.scrollTop=container.scrollHeight},0)}
let parsedLyrics=[];function parseLyrics(lrcString){parsedLyrics=[];if(!lrcString)return;const lines=lrcString.split('\n');const timeRegex=/^\s*\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)$/;lines.forEach(line=>{const match=line.match(timeRegex);if(match){const min=parseInt(match[1]);const sec=parseInt(match[2]);const ms=match[3]?parseFloat("0."+match[3]):0;const text=match[4].trim();if(text){parsedLyrics.push({time:min*60+sec+ms,text:text})}}});parsedLyrics.sort((a,b)=>a.time-b.time);console.log(`[Lyrics] Parsed ${parsedLyrics.length} lines.`)}
function renderLyrics(){const container=document.getElementById('lt-lyrics-scroll-area');if(!container)return;container.innerHTML='';if(parsedLyrics.length===0){container.innerHTML='<div class="lyrics-placeholder" style="margin-top: 50%; color: #888;">暂无歌词</div>';return}
const wrapper=document.createElement('div');wrapper.id='lt-lyrics-wrapper';wrapper.style.padding='50vh 0';parsedLyrics.forEach((line,index)=>{const p=document.createElement('p');p.textContent=line.text;p.dataset.index=index;wrapper.appendChild(p)});container.appendChild(wrapper)}
function syncLyrics(currentTime){if(parsedLyrics.length===0)return;let activeIndex=parsedLyrics.findIndex(l=>l.time>currentTime)-1;if(activeIndex<0){if(parsedLyrics.findIndex(l=>l.time>currentTime)===0){activeIndex=0}else{activeIndex=parsedLyrics.length-1}}
const wrapper=document.getElementById('lt-lyrics-wrapper');const container=document.getElementById('lt-lyrics-scroll-area');if(!wrapper||!container)return;const allLines=wrapper.querySelectorAll('p');const activeLine=allLines[activeIndex];const currentActive=wrapper.querySelector('.active');if(activeLine&&currentActive!==activeLine){if(currentActive)currentActive.classList.remove('active');activeLine.classList.add('active');const scrollTarget=activeLine.offsetTop-(container.clientHeight/2)+(activeLine.offsetHeight/2);container.scrollTo({top:scrollTarget,behavior:'smooth'})}}
function renderLyrics(){const container=document.getElementById('lt-lyrics-scroll-area');if(!container)return;container.innerHTML='';if(parsedLyrics.length===0){container.innerHTML='<div class="lyrics-placeholder" style="margin-top: 50%; color: #888;">暂无歌词</div>';return}
const wrapper=document.createElement('div');wrapper.id='lt-lyrics-wrapper';wrapper.style.transition='transform 0.3s ease-out';wrapper.style.padding='50% 0';parsedLyrics.forEach((line,index)=>{const p=document.createElement('p');p.textContent=line.text;p.dataset.index=index;wrapper.appendChild(p)});container.appendChild(wrapper)}
let currentListenPartnerId=localStorage.getItem(`blmx_listen_partner_${currentCharId}`)||(contacts.length>0?contacts[0].id:null);function updateListenTogetherAvatars(){const myAvatarEl=document.getElementById('lt-user-avatar');if(myAvatarEl){myAvatarEl.src=userProfile.avatar||'https://files.catbox.moe/bialj8.jpeg'}
const charAvatarEl=document.getElementById('lt-char-avatar');if(charAvatarEl){const partner=contacts.find(c=>c.id===currentListenPartnerId);if(partner){charAvatarEl.src=partner.avatar;const durationText=document.getElementById('lt-duration-text');if(durationText&&durationText.textContent.includes('TA')){durationText.textContent=durationText.textContent.replace('TA',partner.name)}}else{charAvatarEl.src='https://files.catbox.moe/bialj8.jpeg'}}}
async function handleSelectListenPartner(){const modal=document.getElementById('diary-owner-modal');const titleEl=modal.querySelector('.title');const originalTitle=titleEl.textContent;titleEl.textContent="选择一起听的朋友";const selectedId=await new Promise(resolve=>{const listContainer=modal.querySelector('.diary-owner-list-container');const closeBtn=modal.querySelector('.close-btn');const newListContainer=listContainer.cloneNode(!1);listContainer.parentNode.replaceChild(newListContainer,listContainer);const cleanupAndResolve=(value)=>{modal.style.display='none';titleEl.textContent=originalTitle;resolve(value)};contacts.forEach(contact=>{const item=document.createElement('div');item.className='diary-owner-list-item';item.innerHTML=`
<img src="${getAvatar(contact.id)}" alt="${contact.name}">
<span>${contact.name}</span>
`;item.addEventListener('click',()=>cleanupAndResolve(contact.id));newListContainer.appendChild(item)});closeBtn.onclick=()=>cleanupAndResolve(null);modal.style.display='flex'});if(selectedId){currentListenPartnerId=selectedId;localStorage.setItem(`blmx_listen_partner_${currentCharId}`,currentListenPartnerId);updateListenTogetherAvatars();await showDialog({mode:'alert',text:`已切换！现在是和 ${getDisplayName(selectedId, null)} 一起听。`})}}
function initAudioPlayer(){const savedSong=localStorage.getItem(`blmx_current_song_${currentCharId}`);if(savedSong){try{Object.assign(currentSong,JSON.parse(savedSong))}catch(e){console.error("读取歌曲缓存失败",e)}}
updateListenTogetherAvatars();const titleEl=document.getElementById('lt-song-title');const artistEl=document.getElementById('lt-artist-name');if(titleEl)titleEl.textContent=currentSong.title;if(artistEl)artistEl.textContent=currentSong.artist;if(currentSong.lrc){parseLyrics(currentSong.lrc);renderLyrics()}
globalAudio.src=currentSong.src;globalAudio.addEventListener('timeupdate',()=>{if(!isDraggingProgress){const currentTime=globalAudio.currentTime;const duration=globalAudio.duration||0;const progressPercent=(currentTime/duration)*100;const slider=document.getElementById('lt-progress-slider');if(slider)slider.value=progressPercent||0;const currentEl=document.getElementById('lt-current-time');if(currentEl)currentEl.textContent=formatTime(currentTime);const totalEl=document.getElementById('lt-total-duration');if(totalEl)totalEl.textContent=formatTime(duration);}
syncLyrics(globalAudio.currentTime)});globalAudio.addEventListener('ended',()=>{switchSong('next',!0)})}
function formatTime(seconds){if(isNaN(seconds))return"00:00";const mins=Math.floor(seconds/60).toString().padStart(2,'0');const secs=Math.floor(seconds%60).toString().padStart(2,'0');return `${mins}:${secs}`}
function cleanLrcString(lrcString){if(!lrcString||typeof lrcString!=='string'){return''}
const cleaned=lrcString.replace(/\[.*?\]/g,'');const lines=cleaned.split('\n');const finalLines=lines.map(line=>line.trim()).filter(line=>line&&!line.startsWith('欢迎来访')&&line!=='-终-');return finalLines.join('\n')}
const GLOBAL_PLAYLIST_KEY='blmx_global_music_playlist';const PLAYLIST_LIMIT=20;function getGlobalPlaylist(){try{const raw=localStorage.getItem(GLOBAL_PLAYLIST_KEY);return raw?JSON.parse(raw):[]}catch(e){console.error("读取歌单失败:",e);return[]}}
function saveGlobalPlaylist(playlist){localStorage.setItem(GLOBAL_PLAYLIST_KEY,JSON.stringify(playlist))}
async function addToGlobalPlaylist(songData){const list=getGlobalPlaylist();if(list.length>=PLAYLIST_LIMIT){await showDialog({mode:'alert',text:`歌单已满 (${list.length}/${PLAYLIST_LIMIT})！\n为了保证手机流畅运行，请先删除一些旧歌曲。`});return!1}
const isDuplicate=list.some(s=>s.src===songData.src);if(isDuplicate){await showDialog({mode:'alert',text:'但这首歌已经在你的歌单里了。'});return!1}
const safeSong={title:songData.title||'未知歌曲',artist:songData.artist||'未知歌手',src:songData.src,lrc:songData.lrc||'',cover:songData.cover||''};list.push(safeSong);saveGlobalPlaylist(list);return!0}
async function removeFromGlobalPlaylist(index){const list=getGlobalPlaylist();if(index>=0&&index<list.length){const songName=list[index].title;const confirmed=await showDialog({mode:'confirm',text:`确定要从歌单删除《${songName}》吗？`});if(confirmed){list.splice(index,1);saveGlobalPlaylist(list);return!0}}
return!1}
function renderGlobalPlaylistUI(){const list=getGlobalPlaylist();const container=document.getElementById('lt-playlist-container');const countEl=document.getElementById('lt-playlist-count');if(!container||!countEl)return;countEl.textContent=list.length;container.innerHTML='';if(list.length===0){container.innerHTML='<p style="text-align:center; color:rgba(255,255,255,0.4); margin-top:2rem; font-size:0.9em;">暂无歌曲<br>点击下方按钮将当前歌曲加入歌单</p>';return}
list.forEach((song,index)=>{const item=document.createElement('div');item.className='lt-playlist-item';if(song.src===currentSong.src){item.classList.add('active')}
item.innerHTML=`
<div class="lt-playlist-info">
	<div class="song-title">${song.title}</div>
	<div class="song-artist">${song.artist}</div>
</div>
<div class="lt-playlist-delete-btn"><i class="fas fa-trash"></i></div>
`;item.addEventListener('click',async(e)=>{if(e.target.closest('.lt-playlist-delete-btn'))return;currentSong={...song};localStorage.setItem(`blmx_current_song_${currentCharId}`,JSON.stringify(currentSong));document.getElementById('lt-song-title').textContent=currentSong.title;document.getElementById('lt-artist-name').textContent=currentSong.artist;parseLyrics(currentSong.lrc);renderLyrics();globalAudio.src=currentSong.src;try{await globalAudio.play();document.getElementById('lt-play-pause-btn').className='fas fa-pause-circle';document.getElementById('lt-vinyl-container').classList.add('playing');document.getElementById('lt-vinyl-view').classList.add('playing')}catch(err){console.error("播放失败:",err);await showDialog({mode:'alert',text:'播放失败，链接可能已失效。'})}
renderGlobalPlaylistUI()});const deleteBtn=item.querySelector('.lt-playlist-delete-btn');deleteBtn.addEventListener('click',async(e)=>{e.stopPropagation();const success=await removeFromGlobalPlaylist(index);if(success){renderGlobalPlaylistUI()}});container.appendChild(item)})}
let musicLoopMode='list';async function toggleMusicLoopMode(){const btn=document.getElementById('lt-mode-btn');if(musicLoopMode==='list'){musicLoopMode='single';if(btn){btn.style.color='var(--wechat-green-icon)'}
await showDialog({mode:'alert',text:'已切换为：单曲循环'})}else{musicLoopMode='list';if(btn)btn.style.color='var(--lt-text-primary)';await showDialog({mode:'alert',text:'已切换为：列表循环'})}}
function switchSong(direction,isAuto=!1){const list=getGlobalPlaylist();if(list.length===0){if(!isAuto)showDialog({mode:'alert',text:'歌单是空的，快去添加歌曲吧！'});return}
let currentIndex=list.findIndex(s=>s.src===currentSong.src);let targetIndex=0;if(isAuto&&musicLoopMode==='single'){if(currentIndex===-1){globalAudio.currentTime=0;globalAudio.play();return}
targetIndex=currentIndex}else{if(direction==='next'){targetIndex=currentIndex+1;if(targetIndex>=list.length)targetIndex=0}else{targetIndex=currentIndex-1;if(targetIndex<0)targetIndex=list.length-1}}
const targetSong=list[targetIndex];currentSong={...targetSong};localStorage.setItem(`blmx_current_song_${currentCharId}`,JSON.stringify(currentSong));document.getElementById('lt-song-title').textContent=currentSong.title;document.getElementById('lt-artist-name').textContent=currentSong.artist;parseLyrics(currentSong.lrc);renderLyrics();globalAudio.src=currentSong.src;globalAudio.play().then(()=>{const btn=document.getElementById('lt-play-pause-btn');if(btn)btn.className='fas fa-pause-circle';document.getElementById('lt-vinyl-container').classList.add('playing');document.getElementById('lt-vinyl-view').classList.add('playing');renderGlobalPlaylistUI()}).catch(err=>{console.error("切歌失败:",err)})}
function initNovelAI(){const naiSwitch=document.getElementById('novelai-switch');const naiDetails=document.getElementById('novelai-details');const naiHeaderToggle=document.getElementById('novelai-header-toggle');const naiChevron=document.getElementById('novelai-chevron');const apiKeyInput=document.getElementById('novelai-api-key');const modelSelect=document.getElementById('novelai-model');const resSelect=document.getElementById('novelai-resolution');const positiveInput=document.getElementById('nai-positive');const negativeInput=document.getElementById('nai-negative');const keyToggleBtn=document.getElementById('novelai-key-toggle');const testBtn=document.getElementById('nai-test-btn');const testPromptInput=document.getElementById('nai-test-prompt');const previewDiv=document.getElementById('nai-test-preview');const previewImg=document.getElementById('nai-preview-img');const savedEnabled=localStorage.getItem(`blmx_nai_enabled_${currentCharId}`)==='true';const savedKey=localStorage.getItem(`blmx_nai_key_${currentCharId}`)||'';const savedModel=localStorage.getItem(`blmx_nai_model_${currentCharId}`)||'nai-diffusion-3';const savedRes=localStorage.getItem(`blmx_nai_res_${currentCharId}`)||'1024x1024';const defaultPositive="masterpiece, best quality, absurdres, very aesthetic, detailed, anime style, 2d, cinematic lighting";const defaultNegative="lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, 3d, realistic";const savedPositive=localStorage.getItem(`blmx_nai_positive_${currentCharId}`)??defaultPositive;const savedNegative=localStorage.getItem(`blmx_nai_negative_${currentCharId}`)??defaultNegative;naiSwitch.checked=savedEnabled;naiDetails.style.display='none';if(naiChevron)naiChevron.style.transform='rotate(0deg)';apiKeyInput.value=savedKey;modelSelect.value=savedModel;resSelect.value=savedRes;positiveInput.value=savedPositive;negativeInput.value=savedNegative;const bindSave=(el,key)=>el.addEventListener('input',(e)=>localStorage.setItem(key,e.target.value));const bindChange=(el,key)=>el.addEventListener('change',(e)=>localStorage.setItem(key,e.target.value));bindSave(apiKeyInput,`blmx_nai_key_${currentCharId}`);bindChange(modelSelect,`blmx_nai_model_${currentCharId}`);bindChange(resSelect,`blmx_nai_res_${currentCharId}`);bindSave(positiveInput,`blmx_nai_positive_${currentCharId}`);bindSave(negativeInput,`blmx_nai_negative_${currentCharId}`);naiSwitch.addEventListener('change',(e)=>{const isEnabled=e.target.checked;localStorage.setItem(`blmx_nai_enabled_${currentCharId}`,isEnabled);naiDetails.style.display=isEnabled?'block':'none';if(naiChevron)naiChevron.style.transform=isEnabled?'rotate(90deg)':'rotate(0deg)'});if(naiHeaderToggle){naiHeaderToggle.addEventListener('click',()=>{const isVisible=naiDetails.style.display==='block';naiDetails.style.display=isVisible?'none':'block';if(naiChevron)naiChevron.style.transform=isVisible?'rotate(0deg)':'rotate(90deg)'})}
keyToggleBtn.addEventListener('click',()=>{const isPassword=apiKeyInput.type==='password';apiKeyInput.type=isPassword?'text':'password';keyToggleBtn.style.opacity=isPassword?'1':'0.6'});if(testBtn){testBtn.addEventListener('click',async()=>{const prompt=testPromptInput.value.trim();if(!prompt)return showDialog({mode:'alert',text:'请输入测试提示词！'});testBtn.disabled=!0;testBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i> 生成中...';previewDiv.style.display='none';try{const pos=positiveInput.value;const finalTestPrompt=[pos,prompt].filter(s=>s.trim()).join(', ');const imageUrl=await generateNAI(finalTestPrompt);previewImg.src=imageUrl;previewDiv.style.display='block';previewImg.onclick=null}catch(error){console.error(error);showDialog({mode:'alert',text:'生成失败: '+error.message})}finally{testBtn.disabled=!1;testBtn.innerHTML='<i class="fas fa-magic"></i> 测试生成'}})}
console.log('[NovelAI] Initialization complete (Collapsible).')}
async function translateToEnglish(text){if(!text||!/[\u4e00-\u9fa5]/.test(text)){return text}
try{console.log(`[Translator] Detecting Chinese, translating: "${text}"`);const targetUrl=`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;const proxyUrl=`https://corsproxy.io/?`+encodeURIComponent(targetUrl);const response=await fetch(proxyUrl);if(!response.ok)throw new Error(`HTTP Error ${response.status}`);const data=await response.json();let result="";if(data&&data[0]){data[0].forEach(item=>{if(item[0])result+=item[0]})}
console.log(`[Translator] Result: "${result}"`);return result||text}catch(e){console.warn("[Translator] Translation failed, using original text:",e);return text}}
async function generateNAI(prompt){const apiKey=localStorage.getItem(`blmx_nai_key_${currentCharId}`);if(!apiKey||!apiKey.startsWith('pst-'))throw new Error('无效的 API Key，请在设置中检查');const model=localStorage.getItem(`blmx_nai_model_${currentCharId}`)||'nai-diffusion-3';const resString=localStorage.getItem(`blmx_nai_res_${currentCharId}`)||'1024x1024';const[width,height]=resString.split('x').map(Number);const isV4=model.includes('v4')||model.includes('4-');const savedNegative=localStorage.getItem(`blmx_nai_negative_${currentCharId}`);const defaultNegative="lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry";const negativePrompt=savedNegative!==null?savedNegative:defaultNegative;let body={input:prompt,model:model,action:'generate',parameters:{width:width,height:height,scale:5,sampler:'k_euler_ancestral',steps:28,n_samples:1,ucPreset:0,qualityToggle:!0,sm:isV4?!1:!0,sm_dyn:!1,seed:Math.floor(Math.random()*9999999999),negative_prompt:negativePrompt}};if(isV4){body.parameters.params_version=3;body.parameters.v4_prompt={caption:{base_caption:prompt,char_captions:[]},use_coords:!1,use_order:!0};body.parameters.v4_negative_prompt={caption:{base_caption:negativePrompt,char_captions:[]},legacy_uc:!1}}
console.log(`[NAI] Model: ${model} (${isV4 ? 'V4 Stream' : 'V3 Zip'})`);const endpoint=isV4?'generate-image-stream':'generate-image';const url=`https://corsproxy.io/?`+encodeURIComponent(`https://image.novelai.net/ai/${endpoint}`);const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},body:JSON.stringify(body)});if(!response.ok){const errText=await response.text();throw new Error(`API Error: ${response.status} ${errText.substring(0, 50)}`)}
if(isV4){const text=await response.text();const lines=text.trim().split('\n');let base64Data=null;for(let i=lines.length-1;i>=0;i--){const line=lines[i].trim();if(line.startsWith('data:')&&!line.includes('[DONE]')){try{const jsonStr=line.substring(5).trim();const data=JSON.parse(jsonStr);if(data.image)base64Data=data.image;else if(data.data)base64Data=data.data;if(base64Data)break}catch(e){console.error('Parse line error:',e)}}}
if(!base64Data)throw new Error('未在返回流中找到图片数据');const binary=atob(base64Data);const array=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)array[i]=binary.charCodeAt(i);const blob=new Blob([array],{type:'image/png'});return URL.createObjectURL(blob)}else{const blob=await response.blob();if(typeof JSZip==='undefined')throw new Error('JSZip library missing');const zip=await JSZip.loadAsync(blob);const filename=Object.keys(zip.files).find(n=>n.match(/\.(png|jpg)$/i));if(!filename)throw new Error('ZIP result is empty');const imgBlob=await zip.file(filename).async('blob');return URL.createObjectURL(imgBlob)}}
function getFootprintsContextForAI(charId){const contact=contacts.find(c=>c.id===charId)||userProfile;const name=getDisplayName(charId,null);const now=new Date(window.currentGameDate);const dateStr=`${now.getMonth() + 1}月${now.getDate()}日`;return `
[任务: 生成角色今日行动足迹]
你现在是 APP 后台数据生成器。请根据角色 **${name}** 的性格、职业和近期剧情，记录 TA 在 **${dateStr}** 截止到当前时间点的行动轨迹。

【输出要求】
1. 只输出一条 JSON 指令，严禁其他废话。
2. \`items\`: 包含 3-6 个主要行程节点。
3. \`type\` 可选值: "stay"(停留/地点), "workout"(运动/健身), "transport"(移动中)。
4. \`transport_desc\` 是两个节点之间的移动描述(如: 步行20分钟)。
5. \`map_events\`: 必须包含 2 个发生在地点的“小插曲/观察/心事”。
6. \`current_location\`: 角色此时此刻所在的具体位置名称（例如：家、公司会议室、XX路口）。

【标准示例】
FOOTPRINTS:{"author":"${charId}","date":"${dateStr}","current_location":"家中书房","items":[{"time":"07:30 - 08:00","type":"workout","location":"滨江公园","title":"晨跑5公里","duration":"30分钟"},{"transport_desc":"地铁 40分钟","time":"09:10-12:00","type":"stay","location":"公司","title":"工作会议","duration":"2小时50分"}],"map_events":[{"location":"地铁站出口","content":"在这个转角闻到了很香的烤红薯味。"},{"location":"公司天台","content":"今天的云看起来像一只柯基。"}]}

请开始生成数据。
`.trim()}
function renderFootprintsData(data){const listContainer=document.getElementById('cp-footprints-list');listContainer.innerHTML='';if(data.date){document.getElementById('cp-footprints-date-title').textContent=data.date}
if(!data.items||data.items.length===0){listContainer.innerHTML='<p style="text-align:center;color:#999;margin-top:2rem;">今日暂无足迹记录</p>'}else{data.items.forEach((item,index)=>{if(item.transport_desc){const connector=document.createElement('div');connector.className='fp-connector';connector.innerHTML=`<i class="fas fa-walking"></i> ${item.transport_desc}`;listContainer.appendChild(connector)}else if(index>0){const connector=document.createElement('div');connector.className='fp-connector';connector.innerHTML=`&nbsp;`;listContainer.appendChild(connector)}
const card=document.createElement('div');card.className='fp-card';let iconClass='fp-icon-circle';let iconHtml='<i class="fas fa-map-marker-alt"></i>';if(item.type==='workout')iconHtml='<i class="fas fa-running"></i>';else if(item.type==='transport'){iconClass+=' transport';iconHtml='<i class="fas fa-car"></i>'}else iconClass+=' stay';card.innerHTML=`
<div class="${iconClass}">${iconHtml}</div>
<div class="fp-info">
	<div class="fp-title">${item.title || '未知活动'}</div>
	<div class="fp-location">${item.location || '未知地点'}</div>
	<div class="fp-time">${item.time}</div>
</div>
<div class="fp-duration">${item.duration || ''}</div>
`;listContainer.appendChild(card)})}
const mapHeader=document.querySelector('.fp-map-header');mapHeader.innerHTML='';if(data.current_location){const realtimeMarker=document.createElement('div');realtimeMarker.className='fp-realtime-marker';realtimeMarker.innerHTML=`
<div class="fp-realtime-ring"></div>
<i class="fas fa-map-marker-alt fp-realtime-icon"></i>
<div class="fp-realtime-label">${data.current_location}</div>
`;mapHeader.appendChild(realtimeMarker)}
if(data.map_events&&data.map_events.length>0){const positions=[{top:'42%',left:'20%'},{top:'35%',left:'75%'}];data.map_events.slice(0,2).forEach((event,index)=>{const pos=positions[index]||{top:'50%',left:'50%'};const marker=document.createElement('div');marker.className='fp-map-marker';marker.style.top=pos.top;marker.style.left=pos.left;marker.innerHTML=`
<i class="fas fa-map-marker-alt"></i>
<div class="fp-map-popup">
	<span class="fp-popup-location">${event.location || '未知地点'}</span>
	<div>${event.content}</div>
</div>
`;marker.addEventListener('click',(e)=>{e.stopPropagation();const isActive=marker.classList.contains('active');document.querySelectorAll('.fp-map-marker.active').forEach(m=>m.classList.remove('active'));if(!isActive)marker.classList.add('active');});mapHeader.appendChild(marker)});mapHeader.addEventListener('click',()=>{document.querySelectorAll('.fp-map-marker.active').forEach(m=>m.classList.remove('active'))})}}
async function triggerFootprintsGeneration(charId){if(isGenerating)return;const container=document.getElementById('cp-footprints-list');container.innerHTML=`
<div class="nai-loading-placeholder" style="margin-top: 5rem;">
	<i class="fas fa-satellite-dish fa-spin"></i> 正在连接卫星获取数据...
</div>
`;isGenerating=!0;updateFooterButtonsState();try{const prompt=getFootprintsContextForAI(charId);latestPromptSentToAI=prompt;const rawResponse=await tavernGenerateFunc({user_input:prompt,should_stream:!1});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){await parseAndHandleAiResponse(latestAiRawResponse)}else{container.innerHTML='<p style="text-align:center;color:#999;">卫星连接超时 (AI无返回)。</p>'}}catch(e){console.error("Footprints generation failed:",e);container.innerHTML=`<p style="text-align:center;color:red;">系统错误: ${e.message}</p>`}finally{isGenerating=!1;updateFooterButtonsState()}}
function openFootprintsApp(){const charId=currentCheckPhoneTargetId;if(!charId)return;navigateTo('footprints');const latestEntry=[...blmxManager.logEntries].reverse().find(e=>e.type==='footprints'&&e.author===charId);if(latestEntry){renderFootprintsData(latestEntry.content)}else{const listContainer=document.getElementById('cp-footprints-list');document.querySelector('.fp-map-header').innerHTML='';listContainer.innerHTML=`
<div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--text-color-tertiary); gap:1rem; margin-top:3rem;">
	<i class="fas fa-shoe-prints" style="font-size:3rem; opacity:0.3;"></i>
	<p style="margin:0;">今日暂无足迹</p>
	<button id="manual-gen-footprints-btn" class="studio-btn primary" style="font-size:0.85em; padding:0.4rem 1rem;">
		<i class="fas fa-satellite-dish"></i> 生成今日轨迹
	</button>
</div>
`;const btn=document.getElementById('manual-gen-footprints-btn');if(btn){btn.addEventListener('click',()=>triggerFootprintsGeneration(charId))}}}
function getGalleryContextForAI(charId){const name=getDisplayName(charId,null);return `
[任务: 生成手机相册内容]
角色: ${name} (ID: ${charId})。
请生成 ${name} 手机相册中“最近项目”的 4 张照片数据。

【要求】
1. **图片描述 (image)**: 必须是**中文**的画面描述，用于AI绘图。包含主体、环境、光影。
2. **碎碎念 (caption)**: 照片下方的配文，体现角色当时的心境、吐槽或秘密，控制在20字以内。
3. **时间 (time)**: 格式如 "昨天 23:45", "周五", "刚刚"。

【输出格式】
只输出一条 JSON 指令，不要其他废话：
GALLERY_UPDATE:{"author":"${charId}","items":[{"image":"图片1的详细中文画面描述...","caption":"碎碎念1","time":"时间1"},{"image":"图片2描述...","caption":"碎碎念2","time":"时间2"},{"image":"图片3描述...","caption":"碎碎念3","time":"时间3"},{"image":"图片4描述...","caption":"碎碎念4","time":"时间4"}],"trashCount":3,"hiddenCount":2}
`.trim()}
async function triggerGalleryGeneration(charId){if(isGenerating)return;const grid=document.getElementById('gallery-recent-grid');grid.innerHTML=`<div class="nai-loading-placeholder" style="grid-column:1/-1; margin-top:2rem;"><i class="fas fa-film fa-spin"></i> 正在显影胶卷...</div>`;isGenerating=!0;updateFooterButtonsState();try{const prompt=getGalleryContextForAI(charId);latestPromptSentToAI=prompt;const rawResponse=await tavernGenerateFunc({user_input:prompt,should_stream:!1});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){await parseAndHandleAiResponse(latestAiRawResponse)}else{grid.innerHTML='<p style="text-align:center;color:#999;">胶卷曝光失败 (AI无返回)。</p>'}}catch(e){console.error("Gallery generation failed:",e);grid.innerHTML=`<p style="text-align:center;color:red;">错误: ${e.message}</p>`}finally{isGenerating=!1;updateFooterButtonsState()}}
function renderGalleryApp(charId){const view=document.getElementById('cp-gallery-view');const grid=document.getElementById('gallery-recent-grid');const titleEl=document.getElementById('cp-gallery-title');const name=getDisplayName(charId,null);titleEl.textContent=`${name}的相册`;const logs=blmxManager.logEntries;const latestEntry=[...logs].reverse().find(e=>e.type==='gallery_update'&&e.author===charId);const hiddenEntry=[...logs].reverse().find(e=>e.type==='hidden_album_update'&&e.author===charId);const trashEntry=[...logs].reverse().find(e=>e.type==='trash_bin_update'&&e.author===charId);const hiddenCount=(hiddenEntry&&hiddenEntry.content.items)?hiddenEntry.content.items.length:0;const trashCount=(trashEntry&&trashEntry.content.items)?trashEntry.content.items.filter(i=>!i.isRestored).length:0;document.querySelector('#folder-hidden .folder-count').textContent=hiddenCount;document.querySelector('#folder-trash .folder-count').textContent=trashCount;if(!latestEntry){grid.innerHTML=`
<div style="grid-column:1/-1; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:2rem; color:var(--text-color-tertiary); gap:1rem;">
	<i class="far fa-images" style="font-size:3rem; opacity:0.3;"></i>
	<p style="margin:0; font-size:0.9em;">相册空空如也</p>
	<button id="manual-gen-gallery-btn" class="studio-btn primary" style="font-size:0.85em; padding:0.4rem 1rem;">
		<i class="fas fa-magic"></i> 生成新回忆
	</button>
</div>
`;document.getElementById('gallery-recent-count').textContent=0;const genBtn=document.getElementById('manual-gen-gallery-btn');if(genBtn){genBtn.addEventListener('click',()=>triggerGalleryGeneration(charId))}
return}
const data=latestEntry.content;grid.innerHTML='';document.getElementById('gallery-recent-count').textContent=data.items.length;data.items.forEach((item,index)=>{const uniqueImgId=`${latestEntry.id}_img_${index}`;let mediaHtml=getNaiContentHtml(uniqueImgId,item.image);let isTextOnly=!1;if(!mediaHtml){isTextOnly=!0;mediaHtml=`
<div class="gallery-text-placeholder" style="width:100%; height:100%; background:var(--card-bg-primary); color:var(--text-color-secondary); padding:0.8rem; box-sizing:border-box; display:flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; text-align:center;">
	<i class="fas fa-quote-left" style="font-size:1.2rem; margin-bottom:0.5rem; opacity:0.3;"></i>
	<div style="font-size:0.8em; line-height:1.5; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; word-break:break-all; opacity:0.8;">
		${item.image}
	</div>
	<div style="font-size:0.6em; color:var(--text-color-tertiary); margin-top:0.5rem;">● 点击查看全文</div>
</div>
`}
const card=document.createElement('div');card.className='gallery-card';card.innerHTML=`
<div class="gallery-img-box">
	${mediaHtml}
</div>
<div class="gallery-caption-box">
	<div class="gallery-caption">${item.caption}</div>
	<div class="gallery-date">${item.time}</div>
</div>
`;if(isTextOnly){const imgBox=card.querySelector('.gallery-img-box');imgBox.addEventListener('click',(e)=>{e.stopPropagation();showDialog({mode:'alert',text:`<div style="text-align:left; white-space: pre-wrap;">${item.image}</div>`})})}
grid.appendChild(card)})}
function getHiddenAlbumContextForAI(charId){const name=getDisplayName(charId,null);return `
[任务: 生成加密相册内容]
角色: ${name} (ID: ${charId})。
场景: 这是你手机里的【隐藏相册】。这里存放着你内心最深处、最私密、不敢示人的欲望或秘密，比如偷拍的照片、做爱的视频等。

【生成要求】
请生成 **2张** 图片数据。

1. **图片画面 (image)**:
* 必须是**中文**。
* **必须是视觉描写**: 必须写出**画面里有什么**。
* **必备要素**: 人物性别(如少年/少女/男人)、具体的身体动作、穿着(或没穿)、环境光影(如昏暗卧室、浴室水汽)。

2. **私密心声 (text)**:
* 这是照片下的配文。
* **字数不限**: 描写当时的心理活动，或者是不可告人的秘密。

3. **时间 (time)**: 格式如 "深夜 02:30", "昨天", "2023年冬"。

【输出格式】
严格遵守以下 JSON 格式，单行输出，不要加任何其他解释：
HIDDEN_ALBUM_UPDATE:{"author":"${charId}","items":[{"image":"图片1的视觉画面描述","text":"私密心声...","time":"时间1"},{"image":"图片2的视觉画面描述","text":"私密心声...","time":"时间2"}]}
`.trim()}
function getTrashBinContextForAI(charId){const name=getDisplayName(charId,null);return `
[任务: 生成最近删除内容]
角色: ${name} (ID: ${charId})。
场景: 这是你的【最近删除】回收站。这里是你因为一系列原因删掉的的照片或备忘录。

【生成要求】
请生成 **3条** 被废弃的内容。

1. **图片/内容描述 (image)**:
* 必须是**中文**的画面视觉描述。
* 可以是拍糊的自拍、编辑了一半的聊天截图、或者是写满字的备忘录画面。
* *示例*: "一张对着镜子的自拍，光线很暗，表情看起来很憔悴，眼神躲闪。"

2. **原本的配文 (text)**:
* 原本想发却没发出去的话，或者备忘录里的碎碎念。

3. **删除理由 (reason)**:
* 为什么删掉它？

4. **剩余天数 (daysLeft)**: 整数，范围 1-29。

【输出格式】
严格遵守以下 JSON 格式，单行输出，不要加任何其他解释：
TRASH_BIN_UPDATE:{"author":"${charId}","items":[{"image":"废弃内容1的画面描述","text":"原本的配文...","reason":"删除理由","time":"删除时间","daysLeft":29},{"image":"废弃内容2的画面描述","text":"...","reason":"...","time":"...","daysLeft":15},{"image":"废弃内容3...","text":"...","reason":"...","time":"...","daysLeft":3}]}
`.trim()}
async function triggerHiddenAlbumGeneration(charId){if(isGenerating)return;const container=document.querySelector('.hidden-album-body');container.innerHTML=`
<div class="nai-loading-placeholder" style="background:rgba(255,255,255,0.1); color:white; border:1px dashed rgba(255,255,255,0.3); padding:2rem;">
	<i class="fas fa-key fa-spin"></i> 正在解密私有区域...<br><br>
	<span style="font-size:0.8em; opacity:0.7;">(AI正在构思私密内容)</span>
</div>`;isGenerating=!0;updateFooterButtonsState();try{const prompt=getHiddenAlbumContextForAI(charId);latestPromptSentToAI=prompt;const rawResponse=await tavernGenerateFunc({user_input:prompt,should_stream:!1});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){await parseAndHandleAiResponse(latestAiRawResponse)}else{container.innerHTML='<p style="color:rgba(255,255,255,0.5); text-align:center;">一片漆黑...(AI无返回)</p>'}}catch(e){console.error("Hidden Album generation failed:",e);container.innerHTML=`<p style="color:#ff6b6b; text-align:center;">解密失败: ${e.message}</p>`}finally{isGenerating=!1;updateFooterButtonsState()}}
function renderHiddenAlbum(charId){const container=document.querySelector('.hidden-album-body');container.innerHTML='';const latestEntry=[...blmxManager.logEntries].reverse().find(e=>e.type==='hidden_album_update'&&e.author===charId);if(!latestEntry){container.innerHTML=`
<div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; color:rgba(255,255,255,0.5); gap:1.5rem;">
	<i class="fas fa-lock" style="font-size:3rem; opacity:0.5;"></i>
	<div style="text-align:center;">
		<p style="margin:0;">私密空间已清空</p>
		<p style="margin:0.5rem 0 0 0; font-size:0.8em; opacity:0.7;">这里存放着内心最深处的秘密</p>
	</div>
	<button id="manual-gen-hidden-btn" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; padding:0.6rem 1.5rem; border-radius:2rem; cursor:pointer;">
		<i class="fas fa-key"></i> 解密新内容
	</button>
</div>
`;const genBtn=document.getElementById('manual-gen-hidden-btn');if(genBtn){genBtn.addEventListener('click',()=>triggerHiddenAlbumGeneration(charId))}
return}
const data=latestEntry.content;data.items.forEach((item,index)=>{const uniqueImgId=`${latestEntry.id}_img_${index}`;let mediaHtml=getNaiContentHtml(uniqueImgId,item.image);let isTextOnly=!1;if(!mediaHtml){isTextOnly=!0;mediaHtml=`
<div class="hidden-placeholder-content">
	<i class="fas fa-eye-slash" style="font-size:1.5em; margin-bottom:0.8rem; opacity:0.5;"></i>
	<div class="hidden-placeholder-desc">${item.image}</div>
	<div class="hidden-placeholder-hint">点击查看画面描述</div>
</div>`}
const card=document.createElement('div');card.className='hidden-card';card.innerHTML=`
<div class="hidden-img-box">
	${mediaHtml}
</div>
<div class="hidden-text-box">${item.text.trim()}</div>
<div class="hidden-date">${item.time}</div>
`;const imgBox=card.querySelector('.hidden-img-box');if(isTextOnly){imgBox.addEventListener('click',(e)=>{e.stopPropagation();showDialog({mode:'alert',text:`<div style="text-align:left; white-space: pre-wrap; line-height:1.6;">${item.image}</div>`})})}else{imgBox.addEventListener('click',()=>{const img=imgBox.querySelector('img');if(img)openImageViewer(img.src);})}
container.appendChild(card)})}
async function triggerTrashBinGeneration(charId){if(isGenerating)return;const container=document.getElementById('trash-list-container');container.innerHTML=`
<div class="nai-loading-placeholder" style="margin-top:2rem;">
	<i class="fas fa-recycle fa-spin"></i> 正在扫描数据碎片...
</div>`;isGenerating=!0;updateFooterButtonsState();try{const prompt=getTrashBinContextForAI(charId);latestPromptSentToAI=prompt;const rawResponse=await tavernGenerateFunc({user_input:prompt,should_stream:!1});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){await parseAndHandleAiResponse(latestAiRawResponse)}else{container.innerHTML='<p style="color:#999; text-align:center;">垃圾桶是空的。</p>'}}catch(e){console.error("Trash Bin generation failed:",e);container.innerHTML=`<p style="color:red; text-align:center;">错误: ${e.message}</p>`}finally{isGenerating=!1;updateFooterButtonsState()}}
function renderTrashBin(charId){const container=document.getElementById('trash-list-container');container.innerHTML='';const latestEntry=[...blmxManager.logEntries].reverse().find(e=>e.type==='trash_bin_update'&&e.author===charId);if(!latestEntry){container.innerHTML=`
<div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--text-color-tertiary); gap:1rem;">
	<i class="fas fa-trash" style="font-size:3rem; opacity:0.3;"></i>
	<p style="margin:0;">垃圾桶是空的</p>
	<button id="manual-gen-trash-btn" class="studio-btn secondary" style="font-size:0.85em; padding:0.4rem 1rem;">
		<i class="fas fa-search"></i> 扫描数据碎片
	</button>
</div>
`;const genBtn=document.getElementById('manual-gen-trash-btn');if(genBtn){genBtn.addEventListener('click',()=>triggerTrashBinGeneration(charId))}
return}
const data=latestEntry.content;data.items.forEach((item,index)=>{if(item.isRestored)return;const uniqueImgId=`${latestEntry.id}_img_${index}`;let mediaHtml=getNaiContentHtml(uniqueImgId,item.image);if(!mediaHtml){mediaHtml=`<div style="width:100%; height:100%; background:#ddd; display:flex; justify-content:center; align-items:center; color:#999; font-size:0.8em;"><i class="fas fa-image"></i></div>`}
const row=document.createElement('div');row.className='trash-item';row.innerHTML=`
<div class="trash-thumb">${mediaHtml}</div>
<div class="trash-content">
	<div class="trash-reason">删除理由: ${item.reason}</div>
	<div class="trash-text-preview">"${item.text}"</div>
	<div class="trash-meta">
		<span class="trash-countdown">剩余 ${item.daysLeft} 天</span>
		<span class="trash-recover-btn">恢复</span>
	</div>
</div>
`;const recoverBtn=row.querySelector('.trash-recover-btn');recoverBtn.addEventListener('click',async(e)=>{e.stopPropagation();row.style.transition='all 0.3s ease';row.style.opacity='0';row.style.transform='translateX(20px)';setTimeout(async()=>{item.isRestored=!0;await recoverItemToGallery(charId,item,uniqueImgId);row.remove();if(container.children.length===0){container.innerHTML='<p style="text-align:center;color:#999;margin-top:2rem;">没有废弃项目了。</p>'}},300)});row.addEventListener('click',()=>{showDialog({mode:'alert',text:`
<div style="text-align:left;">
	<div style="font-weight:bold; margin-bottom:0.5rem; color:#E53935;">为什么删除：${item.reason}</div>
	<div style="margin-bottom:0.5rem; padding:0.5rem; background:#f5f5f5; border-radius:4px; font-size:0.9em;">${item.image}</div>
	<div style="font-style:italic; color:#666;">"${item.text}"</div>
</div>
`})});container.appendChild(row)})}
async function recoverItemToGallery(charId,trashItem,trashImgId){const newItem={image:trashItem.image,caption:`[已恢复] ${trashItem.text}`,time:"刚刚"};const latestGallery=[...blmxManager.logEntries].reverse().find(e=>e.type==='gallery_update'&&e.author===charId);let newItemsList=[];if(latestGallery&&latestGallery.content&&latestGallery.content.items){newItemsList=[...latestGallery.content.items]}
newItemsList.unshift(newItem);const updateData={author:charId,items:newItemsList,hiddenCount:latestGallery?latestGallery.content.hiddenCount:2,trashCount:latestGallery?(latestGallery.content.trashCount-1):0};const newEntryId=`msg-gallery-recover-${Date.now()}`;blmxManager.addEntry({id:newEntryId,type:'gallery_update',author:charId,content:updateData,timestamp:new Date(window.currentGameDate).toISOString()});const cachedStatus=runtimeImageCache.get(trashImgId);if(cachedStatus){runtimeImageCache.set(`${newEntryId}_img_0`,cachedStatus)}else{processEntryWithNAI(`${newEntryId}_img_0`,newItem.image,'gallery')}
await blmxManager.persistLogToStorage();await showDialog({mode:'alert',text:'照片已恢复到相册！'})}
function getShoppingContextForAI(charId){const name=getDisplayName(charId,null);return `
[任务: 生成手机购物车内容]
角色: ${name} (ID: ${charId})。
场景: 这是 ${name} 的淘宝购物车。请根据角色性格、近期剧情和内心隐藏的欲望，生成 **3-4个** 待购商品。

【商品要求】
1. **店铺名 (shopName)**: 必须像真实的淘宝店铺名，如"xx旗舰店"、"xx代购"、"xx的手作铺"。
2. **商品标题 (title)**: 充满淘宝风格的**超长标题**，包含修饰词。例如："【现货】法式复古..."。
3. **内心备注 (note)**: **核心有趣点**。角色为什么把这个放购物车？是在犹豫价格？是在幻想使用场景？还是不敢买？
4. **促销标签 (reason)**: 促使角色加购的动机，如"满300减40"、"深夜冲动"、"博主推荐"、"仅剩一件"。
5. **图片描述 (image)**: **中文**的视觉画面描述，用于AI生成商品图。

【输出格式】
严格遵守以下 JSON 格式，只输出一条 JSON 指令，严禁其他废话：
SHOPPING_UPDATE:{"author":"${charId}","items":[{"shopName":"店铺A","title":"长标题A...","price":"199.00","image":"商品的视觉描述...","note":"内心备注...","reason":"促销标签"},{"shopName":"店铺B","title":"长标题B...","price":"59.90","image":"描述...","note":"备注...","reason":"标签"}]}
`.trim()}
async function triggerShoppingGeneration(charId){if(isGenerating)return;const container=document.querySelector('#cp-shopping-view .shopping-body');container.innerHTML=`
<div class="nai-loading-placeholder" style="margin-top: 5rem;">
	<i class="fas fa-shopping-bag fa-spin"></i> 正在同步购物车数据...
</div>
`;isGenerating=!0;updateFooterButtonsState();try{const prompt=getShoppingContextForAI(charId);latestPromptSentToAI=prompt;const rawResponse=await tavernGenerateFunc({user_input:prompt,should_stream:!1});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){await parseAndHandleAiResponse(latestAiRawResponse)}else{container.innerHTML='<p style="text-align:center;color:#999;margin-top:2rem;">购物车是空的 (AI无返回)。</p>'}}catch(e){console.error("Shopping generation failed:",e);container.innerHTML=`<p style="text-align:center;color:red;">加载失败: ${e.message}</p>`}finally{isGenerating=!1;updateFooterButtonsState()}}
async function handleAddToShoppingCart(){if(!currentProductDetails)return;const charId=currentCheckPhoneTargetId;if(!charId)return;const newItem={shopName:currentProductDetails.shop||"未知店铺",title:currentProductDetails.title,price:currentProductDetails.price,image:currentProductDetails.image,note:"从详情页加购",reason:"种草",addedAt:Date.now()};let latestEntry=[...blmxManager.logEntries].reverse().find(e=>e.type==='shopping_update'&&e.author===charId);let newItemsList=[];if(latestEntry&&latestEntry.content&&latestEntry.content.items){newItemsList=[...latestEntry.content.items]}
newItemsList.unshift(newItem);blmxManager.logEntries=blmxManager.logEntries.filter(e=>!(e.type==='shopping_update'&&e.author===charId));const newEntryId=`msg-shopping-update-${Date.now()}`;const updateData={author:charId,items:newItemsList};blmxManager.addEntry({id:newEntryId,type:'shopping_update',author:charId,content:updateData,timestamp:new Date(window.currentGameDate).toISOString()});await blmxManager.persistLogToStorage();await showDialog({mode:'alert',text:'已成功加入购物车！'})}
async function handleShoppingManage(){const view=document.getElementById('cp-shopping-view');const manageBtn=document.getElementById('cp-shopping-manage-btn');const footerLeft=view.querySelector('.sp-footer-left');const footerRight=view.querySelector('.sp-footer-right');const isEditMode=manageBtn.textContent==='完成';if(isEditMode){manageBtn.textContent='管理';manageBtn.style.color='';footerLeft.style.display='flex';footerRight.innerHTML=`
<div class="sp-total-price">合计: <span>¥0.00</span></div>
<button class="sp-checkout-btn">帮TA清空</button>
`;const charId=currentCheckPhoneTargetId;const latestEntry=[...blmxManager.logEntries].reverse().find(e=>e.type==='shopping_update'&&e.author===charId);view.querySelector('.sp-checkout-btn').onclick=()=>handleShoppingCheckout(charId,latestEntry?latestEntry.id:null);view.querySelectorAll('.item-checkbox').forEach(cb=>cb.checked=!1)}else{manageBtn.textContent='完成';manageBtn.style.color='var(--tb-primary-orange)';footerLeft.style.display='flex';footerRight.innerHTML=`
<button class="sp-delete-btn" style="border:1px solid #ff4d4f; color:#ff4d4f; background:transparent; border-radius:20px; padding:0.4rem 1.2rem; font-size:0.9em;">删除</button>
`;view.querySelector('.sp-delete-btn').onclick=async()=>{const checkedBoxes=view.querySelectorAll('.item-checkbox:checked');if(checkedBoxes.length===0)return;const confirmed=await showDialog({mode:'confirm',text:`确定要删除这 ${checkedBoxes.length} 个商品吗？`});if(!confirmed)return;const charId=currentCheckPhoneTargetId;const latestEntry=[...blmxManager.logEntries].reverse().find(e=>e.type==='shopping_update'&&e.author===charId);if(!latestEntry)return;const indicesToRemove=[];checkedBoxes.forEach(cb=>{const itemEl=cb.closest('.sp-item');indicesToRemove.push(parseInt(itemEl.dataset.itemIndex,10))});const oldItems=latestEntry.content.items;const newItems=oldItems.filter((_,idx)=>!indicesToRemove.includes(idx));blmxManager.logEntries=blmxManager.logEntries.filter(e=>!(e.type==='shopping_update'&&e.author===charId));const newEntryId=`msg-shopping-del-${Date.now()}`;blmxManager.addEntry({id:newEntryId,type:'shopping_update',author:charId,content:{author:charId,items:newItems},timestamp:new Date(window.currentGameDate).toISOString()});await blmxManager.persistLogToStorage();handleShoppingManage();renderShoppingApp(charId);await showDialog({mode:'alert',text:'删除成功。'})}}}
function renderShoppingApp(charId){const view=document.getElementById('cp-shopping-view');const container=view.querySelector('.shopping-body');const totalPriceEl=view.querySelector('.sp-total-price span');const checkoutBtn=view.querySelector('.sp-checkout-btn');const selectAllBtn=view.querySelector('.sp-footer-left .sp-checkbox');const latestEntry=[...blmxManager.logEntries].reverse().find(e=>e.type==='shopping_update'&&e.author===charId);const items=(latestEntry&&latestEntry.content&&latestEntry.content.items)?latestEntry.content.items:[];container.innerHTML='';const name=getDisplayName(charId,null);view.querySelector('.settings-header .title').textContent=`${name}的购物车 (${items.length})`;if(items.length===0){container.innerHTML=`
            <div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--text-color-tertiary); gap:1rem; margin-top: 5rem;">
                <i class="fas fa-shopping-cart" style="font-size:3rem; opacity:0.3;"></i>
                <p style="margin:0;">购物车是空的</p>
                <button id="manual-gen-shop-btn" class="studio-btn primary" style="font-size:0.85em; padding:0.4rem 1rem;">
                    <i class="fas fa-magic"></i> 帮TA加购商品
                </button>
            </div>
        `;const genBtn=document.getElementById('manual-gen-shop-btn');if(genBtn){genBtn.addEventListener('click',()=>triggerShoppingGeneration(charId))}
if(totalPriceEl)totalPriceEl.textContent='¥0.00';if(checkoutBtn){checkoutBtn.textContent='购物车为空';checkoutBtn.disabled=!0;checkoutBtn.style.opacity='0.6'}
if(selectAllBtn)selectAllBtn.checked=!1;return}
const groupedItems={};items.forEach((item,index)=>{item._index=index;const shopName=item.shopName||"未知店铺";if(!groupedItems[shopName])groupedItems[shopName]=[];groupedItems[shopName].push(item)});Object.keys(groupedItems).forEach(shopName=>{const shopItems=groupedItems[shopName];const shopCard=document.createElement('div');shopCard.className='sp-shop-card';let shopHtml=`
            <div class="sp-shop-header">
                <i class="fas fa-store sp-shop-icon taobao"></i>
                <span class="sp-shop-name">${shopName} <i class="fas fa-chevron-right" style="font-size:0.7em; color:#ccc;"></i></span>
            </div>
        `;shopItems.forEach(item=>{const globalIndex=item._index;const uniqueImgId=(latestEntry&&latestEntry.id)?`${latestEntry.id}_img_${globalIndex}`:`temp_img_${globalIndex}`;let mediaHtml=getNaiContentHtml(uniqueImgId,item.image);let isTextOnly=!1;if(mediaHtml){if(mediaHtml.includes('<img')){}}else{if(item.image&&(item.image.startsWith('http')||item.image.startsWith('blob:'))){mediaHtml=`<img src="${item.image}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.onerror=null;this.src='https://files.catbox.moe/c41va3.jpg';">`}else{isTextOnly=!0;const safeText=(item.image||"").replace(/"/g,'&quot;');mediaHtml=`<div class="sp-text-placeholder" data-full-text="${safeText}" style="background: url('https://files.catbox.moe/c41va3.jpg') center/cover no-repeat; color: transparent;">${item.image}</div>`}}
shopHtml+=`
            <div class="sp-item" data-item-index="${globalIndex}" data-price="${item.price || 0}" data-title="${item.title || '未知商品'}">
                <input type="checkbox" class="sp-checkbox item-checkbox" style="margin-top: 2.5rem;">
                
                <div class="sp-item-thumb">
                    ${mediaHtml}
                </div>
                
                <div class="sp-item-details">
                    <div class="sp-item-title">${item.title || '无标题'}</div>
                    <div class="sp-item-monologue">备注: ${item.note || ''}</div>
                    <div class="sp-item-reason">${item.reason || ''}</div>
                    <div class="sp-price-row">
                        <span class="sp-price">${item.price || '0.00'}</span>
                        <div class="sp-quantity">
                            <span class="sp-qty-btn">-</span>
                            <span class="sp-qty-num">1</span>
                            <span class="sp-qty-btn">+</span>
                        </div>
                    </div>
                </div>
            </div>
            `});shopCard.innerHTML=shopHtml;container.appendChild(shopCard);shopCard.querySelectorAll('.sp-item-monologue').forEach((el,i)=>{el.addEventListener('click',(e)=>{e.stopPropagation();showDialog({mode:'alert',text:`<strong>🛒 加购备注</strong>\n\n${shopItems[i].note || ''}`})})});shopCard.querySelectorAll('.sp-item-thumb').forEach(thumb=>{const img=thumb.querySelector('img');const placeholder=thumb.querySelector('.sp-text-placeholder');thumb.addEventListener('click',(e)=>{e.stopPropagation();if(img){openImageViewer(img.src)}else if(placeholder){showDialog({mode:'alert',text:placeholder.dataset.fullText})}})})});const itemCheckboxes=container.querySelectorAll('.item-checkbox');const updateTotal=()=>{let total=0;let count=0;itemCheckboxes.forEach(cb=>{if(cb.checked){const itemEl=cb.closest('.sp-item');let priceStr=String(itemEl.dataset.price).replace(/,/g,'');total+=parseFloat(priceStr)||0;count++}});if(totalPriceEl)totalPriceEl.textContent='¥'+total.toFixed(2);if(checkoutBtn){const manageBtn=document.getElementById('cp-shopping-manage-btn');const isManageMode=manageBtn&&manageBtn.textContent==='完成';if(!isManageMode){if(count===0){checkoutBtn.textContent=`请选择`;checkoutBtn.disabled=!0;checkoutBtn.style.opacity='0.6'}else{checkoutBtn.textContent=`帮TA付 (${count})`;checkoutBtn.disabled=!1;checkoutBtn.style.opacity='1'}}}};itemCheckboxes.forEach(cb=>cb.addEventListener('change',updateTotal));if(selectAllBtn){const newSelectAllBtn=selectAllBtn.cloneNode(!0);selectAllBtn.parentNode.replaceChild(newSelectAllBtn,selectAllBtn);newSelectAllBtn.addEventListener('change',(e)=>{const isChecked=e.target.checked;itemCheckboxes.forEach(cb=>cb.checked=isChecked);updateTotal()})}
if(checkoutBtn){checkoutBtn.onclick=()=>handleShoppingCheckout(charId,latestEntry?latestEntry.id:null)}
updateTotal()}
async function handleShoppingCheckout(charId,entryId){const view=document.getElementById('cp-shopping-view');const checkedBoxes=view.querySelectorAll('.item-checkbox:checked');if(checkedBoxes.length===0)return;const paidItems=[];const indicesToRemove=[];let totalAmount=0;checkedBoxes.forEach(cb=>{const itemEl=cb.closest('.sp-item');const index=parseInt(itemEl.dataset.itemIndex,10);const title=itemEl.dataset.title;const price=parseFloat(itemEl.dataset.price);paidItems.push({title,price});indicesToRemove.push(index);totalAmount+=price});const confirmed=await showDialog({mode:'confirm',text:`确定要帮 ${getDisplayName(charId, null)} 支付这 ${paidItems.length} 件商品吗？\n合计：¥${totalAmount.toFixed(2)}`});if(!confirmed)return;const logEntry=blmxManager.logEntries.find(e=>e.id===entryId);if(logEntry&&logEntry.content&&logEntry.content.items){indicesToRemove.sort((a,b)=>b-a);indicesToRemove.forEach(idx=>{logEntry.content.items.splice(idx,1)});await blmxManager.persistLogToStorage()}
const receiptData={payer:userProfile.name,receiver:charId,items:paidItems,total:totalAmount.toFixed(2),timestamp:new Date().toLocaleString()};let convo=conversations.find(c=>c.type==='single'&&c.members.includes(charId));if(!convo){convo={id:`convo_single_${charId}`,type:'single',members:['user',charId]};conversations.push(convo)}
blmxManager.addEntry({type:'payment_receipt',sender:'user',conversationId:convo.id,content:JSON.stringify(receiptData),timestamp:new Date(window.currentGameDate).toISOString()});await blmxManager.persistLogToStorage();saveData();await showDialog({mode:'alert',text:'支付成功！回执单已发送给对方。'});renderShoppingApp(charId);navigateTo('wechatChat',{conversationId:convo.id})}
function getTaobaoFeedContext(charId,keyword=null,theme=null){const name=getDisplayName(charId,null);let taskDescription="";let extraInstruction="";if(keyword){taskDescription=`用户刚刚搜索了关键词【${keyword}】。请生成 4 个与该关键词高度相关但风格各异的搜索结果商品。同时将 "${keyword}" 插入到 history 搜索历史数组的第一位。`}else if(theme){taskDescription=`用户点击了首页的【${theme.name}】频道。请根据该频道的特性，为角色推荐 4 个商品。`;if(theme.instruction){extraInstruction=`\n**【频道特殊要求】**:\n${theme.instruction}`}}else{taskDescription=`请根据该角色的**性格、职业、近期经历、潜在欲望**，推算出TA打开淘宝时会看到的首页内容 (推荐流)。`}
return `
[任务: 淘宝首页内容生成]
用户: ${name} (ID: ${charId})。
${taskDescription}
${extraInstruction}

【生成要求】
1. **搜索历史 (history)**: 生成 3-5 个短词。要求非常贴合角色当下的状态。
2. **推荐商品流 (items)**: 生成 4 个商品卡片。
* **标题 (title)**: 充满淘宝风格的商品标题。
* **店铺 (shop)**: 真实的或有趣的店铺名。
* **价格 (price)**: 真实价格字符串。
* **图片描述 (image)**: **中文**画面描述，用于AI生图，主体清晰，突出商品。
* **推荐标签 (tag)**: 给出推荐理由。如："你搜过xx"、"偷看主页发现"、"深夜emo"、"同城热销"。

【输出格式】
只输出一条 JSON 指令，严禁废话：
TAOBAO_HOME:{"author":"${charId}","history":["搜索词1","搜索词2"],"items":[{"title":"商品标题...","price":"29.9","shop":"xx旗舰店","image":"视觉描述...","tag":"推荐理由"},{"title":"...","price":"...","shop":"...","image":"...","tag":"..."}]}
`.trim()}
async function triggerShoppingHomeGeneration(charId,keyword=null,theme=null){if(isGenerating)return;const container=document.getElementById('shopping-home-feed');let loadingText='正在刷新推荐流...';if(keyword)loadingText=`正在搜索 "${keyword}"...`;else if(theme)loadingText=`正在进入【${theme.name}】频道...`;container.innerHTML=`
<div class="nai-loading-placeholder" style="grid-column: 1 / -1; margin-top: 2rem;">
	<i class="fas fa-search fa-spin"></i> ${loadingText}
</div>
`;isGenerating=!0;updateFooterButtonsState();try{const prompt=getTaobaoFeedContext(charId,keyword,theme);latestPromptSentToAI=prompt;const rawResponse=await tavernGenerateFunc({user_input:prompt,should_stream:!1});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){await parseAndHandleAiResponse(latestAiRawResponse)}else{container.innerHTML='<p style="text-align:center;color:#999; grid-column:1/-1;">加载失败 (AI无返回)。</p>'}}catch(e){console.error("Shopping Home generation failed:",e);container.innerHTML=`<p style="text-align:center;color:red; grid-column:1/-1;">错误: ${e.message}</p>`}finally{isGenerating=!1;updateFooterButtonsState()}}
function renderShoppingHome(charId){const container=document.getElementById('shopping-home-feed');if(!container)return;const latestEntry=[...blmxManager.logEntries].reverse().find(e=>e.type==='taobao_home'&&e.author===charId);if(!latestEntry){container.innerHTML=`
<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-color-tertiary);">
	<i class="fas fa-shopping-bag" style="font-size:3rem; opacity:0.3; margin-bottom:1rem;"></i>
	<p>首页空空如也</p>
	<button id="init-tb-home-btn" class="studio-btn primary" style="margin-top:1rem;">
		<i class="fas fa-sync-alt"></i> 刷新推荐
	</button>
</div>
`;const initBtn=document.getElementById('init-tb-home-btn');if(initBtn)initBtn.onclick=()=>triggerShoppingHomeGeneration(charId);return}
const data=latestEntry.content;container.innerHTML='';if(data.items&&data.items.length>0){data.items.forEach((item,index)=>{const uniqueImgId=`${latestEntry.id}_img_${index}`;let mediaHtml=getNaiContentHtml(uniqueImgId,item.image);if(!mediaHtml){const safeText=(item.image||"").replace(/"/g,'&quot;');mediaHtml=`<div class="tb-img-placeholder-text" data-full-text="${safeText}" style="background: url('https://files.catbox.moe/c41va3.jpg') center/cover no-repeat;"></div>`}
const card=document.createElement('div');card.className='tb-product-card';card.innerHTML=`
<div class="tb-product-img">
	${mediaHtml}
</div>
<div class="tb-product-info">
	<div class="tb-product-title">${item.title || '未知商品'}</div>
	<div class="tb-tags-row">
		<span class="tb-tag">${item.tag || '猜你喜欢'}</span>
	</div>
	<div class="tb-price-row">
		<span class="tb-symbol">¥</span>
		<span class="tb-price-num">${item.price || '0.00'}</span>
		<span class="tb-sales">${item.shop || '淘宝好店'}</span>
	</div>
</div>
`;const placeholder=card.querySelector('.tb-img-placeholder-text');if(placeholder){placeholder.addEventListener('click',(e)=>{e.stopPropagation();showDialog({mode:'alert',text:placeholder.dataset.fullText})})}
container.appendChild(card)})}
const searchInput=document.querySelector('.tb-search-input');if(searchInput&&data.history&&data.history.length>0){if(searchTickerInterval)clearInterval(searchTickerInterval);let historyIndex=0;searchInput.placeholder=data.history[0];searchTickerInterval=setInterval(()=>{historyIndex=(historyIndex+1)%data.history.length;searchInput.placeholder=data.history[historyIndex]},3000)}}
function renderShoppingProfile(){const charId=currentCheckPhoneTargetId;if(!charId)return;const contact=contacts.find(c=>c.id===charId);const name=contact?(contact.remark||contact.name):'淘宝用户';const avatar=contact?contact.avatar:'https://files.catbox.moe/bialj8.jpeg';document.getElementById('tb-user-name').textContent=name;document.getElementById('tb-user-avatar').src=avatar}
function renderProductDetail(product){currentProductDetails=product;const heroContainer=document.getElementById('tb-detail-hero');heroContainer.innerHTML='';let mediaHtml='';if(product.image&&product.image.startsWith('http')){mediaHtml=`<img src="${product.image}" alt="Product Image">`}else{mediaHtml=`
<div class="tb-detail-hero-text">
	${product.image || "暂无画面描述"}
</div>
`}
if(product._imgBlobUrl){mediaHtml=`<img src="${product._imgBlobUrl}" alt="Generated Image">`}
heroContainer.innerHTML=mediaHtml;document.getElementById('tb-detail-price').textContent=product.price||'99.00';document.getElementById('tb-detail-title').textContent=product.title||'未知商品';document.getElementById('tb-detail-shop-name').textContent=product.shop||'官方旗舰店'}
function setupEventListeners(){document.getElementById('app-check-phone').addEventListener('click',async()=>{console.log("[CheckPhone] App clicked!");const modal=document.getElementById('diary-owner-modal');const titleEl=modal.querySelector('.title');const listContainer=modal.querySelector('.diary-owner-list-container');const closeBtn=modal.querySelector('.close-btn');const originalTitle=titleEl.textContent;titleEl.textContent="查看谁的手机？";const targetId=await new Promise(resolve=>{const newListContainer=listContainer.cloneNode(!1);listContainer.parentNode.replaceChild(newListContainer,listContainer);const cleanup=(val)=>{modal.style.display='none';titleEl.textContent=originalTitle;resolve(val)};contacts.forEach(contact=>{const item=document.createElement('div');item.className='diary-owner-list-item';item.innerHTML=`
<img src="${getAvatar(contact.id)}" alt="${contact.name}">
<span>${getDisplayName(contact.id, null)}</span>
`;item.addEventListener('click',()=>cleanup(contact.id));newListContainer.appendChild(item)});closeBtn.onclick=()=>cleanup(null);modal.style.display='flex'});if(targetId){currentCheckPhoneTargetId=targetId;const name=getDisplayName(targetId,null);document.getElementById('check-phone-title').textContent=`${name}的手机`;navigateTo('checkPhone')}});document.getElementById('check-phone-back-btn').addEventListener('click',()=>{currentCheckPhoneTargetId=null;navigateTo('home')});document.querySelector('.check-phone-grid').addEventListener('click',(e)=>{const item=e.target.closest('.cp-app-item');if(item){const appType=item.dataset.app;if(appType==='footprints'){openFootprintsApp()}else if(appType==='gallery'){const charId=currentCheckPhoneTargetId;if(!charId)return;navigateTo('gallery');renderGalleryApp(charId)}else if(appType==='shopping'){const charId=currentCheckPhoneTargetId;if(!charId)return;navigateTo('shoppingHome')}else{const appName=item.querySelector('.cp-app-name').textContent;showDialog({mode:'alert',text:`正在打开 [${appName}] ...\n(功能开发中)`})}}});const feedContainer=document.getElementById('shopping-home-feed');if(feedContainer){feedContainer.addEventListener('click',(e)=>{const card=e.target.closest('.tb-product-card');if(!card)return;if(e.target.classList.contains('tb-img-placeholder-text'))return;const imgEl=card.querySelector('img');const blobUrl=imgEl?imgEl.src:null;const descEl=card.querySelector('.tb-img-placeholder-text');const productData={title:card.querySelector('.tb-product-title').textContent,price:card.querySelector('.tb-price-num').textContent,shop:card.querySelector('.tb-sales').textContent,image:descEl?descEl.dataset.fullText:(imgEl?imgEl.src:""),_imgBlobUrl:blobUrl};navigateTo('productDetail');renderProductDetail(productData)})}
document.getElementById('tb-detail-back-btn').addEventListener('click',()=>{navigateTo('shoppingHome')});document.getElementById('tb-detail-add-cart').addEventListener('click',()=>{handleAddToShoppingCart()});document.getElementById('tb-detail-buy-now').addEventListener('click',async()=>{if(!currentProductDetails)return;const targetCharId=currentCheckPhoneTargetId;if(!currentConversationId&&targetCharId){let convo=conversations.find(c=>c.type==='single'&&c.members.includes(targetCharId));if(!convo){convo={id:`convo_single_${targetCharId}`,type:'single',members:['user',targetCharId],unread:0,pinned:!1,lastActivity:Date.now()};conversations.push(convo)}
currentConversationId=convo.id}
if(!currentConversationId){await showDialog({mode:'alert',text:'错误：无法确定分享目标，请先进入一个聊天窗口或选择查看对象的手机。'});return}
const confirmed=await showDialog({mode:'confirm',text:'确定要立即购买并分享给对方吗？'});if(confirmed){const productData={title:currentProductDetails.title,price:currentProductDetails.price,image:currentProductDetails.image,shop:currentProductDetails.shop};stageAndDisplayEntry({type:'product_share',sender:'me',content:productData});await showDialog({mode:'alert',text:'商品已分享！'});navigateTo('wechatChat',{conversationId:currentConversationId})}});const tbClearBtn=document.querySelector('.tb-clear-home-btn');if(tbClearBtn){tbClearBtn.addEventListener('click',async()=>{const charId=currentCheckPhoneTargetId;if(!charId)return;const confirmed=await showDialog({mode:'confirm',text:'确定要清空当前的商品推荐流吗？\n清空后可点击刷新按钮重新生成。'});if(confirmed){blmxManager.logEntries=blmxManager.logEntries.filter(entry=>!(entry.type==='taobao_home'&&entry.author===charId));await blmxManager.persistLogToStorage();renderShoppingHome(charId);await showDialog({mode:'alert',text:'推荐流已清空。'})}})}
document.getElementById('cp-shopping-manage-btn').addEventListener('click',()=>{handleShoppingManage()});const navToHomeBtn=document.getElementById('nav-to-home-from-cart');if(navToHomeBtn){navToHomeBtn.addEventListener('click',()=>{navigateTo('shoppingHome')})}
const navToCartBtn=document.getElementById('nav-to-cart');if(navToCartBtn){navToCartBtn.addEventListener('click',()=>{const charId=currentCheckPhoneTargetId;if(!charId)return;navigateTo('shopping');renderShoppingApp(charId)})}
const shoppingBackBtn=document.getElementById('cp-shopping-back-btn');document.querySelector('.tb-scan-icon').addEventListener('click',()=>{navigateTo('checkPhone')});document.getElementById('cp-shopping-back-btn').addEventListener('click',()=>{navigateTo('shoppingHome')});const TB_ICON_THEMES={"想去旅行":{name:"想去旅行",instruction:"推荐旅行相关的商品，如机票、酒店套餐、旅行收纳、度假穿搭。根据角色最近是否劳累决定是推荐'特种兵旅游'还是'躺平度假'。"},"深夜冲动":{name:"深夜冲动",instruction:"推荐适合深夜下单的商品：高热量夜宵、成人玩具、昂贵的数码产品、情感抚慰用品。侧重于'冲动消费'和'私密欲望'。"},"闲置回血":{name:"闲置回血",instruction:"【特殊反向逻辑】推荐角色**想要卖掉**的二手物品。例如：前任送的礼物、不再喜欢的旧物、冲动消费后的后悔药。店铺名显示为'我的闲置'。"},"海外代购":{name:"海外代购",instruction:"推荐昂贵的进口商品、奢侈品、或者国内买不到的小众好物。"},"健康养生":{name:"健康养生",instruction:"推荐保健品、养生壶、护肝片、防脱发产品。侧重于当代年轻人的'赛博养生'。"},"礼物推荐":{name:"礼物推荐",instruction:"角色可能正在考虑给某人（可能是{{user}}，也可能是其他人）买礼物。推荐一些具有送礼属性的精致商品。"},"角色穿搭":{name:"角色穿搭",instruction:"基于角色的外貌描写和风格，推荐TA可能会喜欢的衣服、配饰、鞋包。"},"宅家必备":{name:"宅家必备",instruction:"推荐提升居家幸福感的好物，游戏机、懒人沙发、零食大礼包、智能家居。"},"浏览历史":{name:"浏览历史",instruction:"展示角色最近看过但没买的东西，反映TA的纠结和犹豫。"},"全部频道":{name:"猜你喜欢",instruction:"生成一组完全随机、脑洞大开的商品，试图探测角色的潜在兴趣。"}};const iconsGrid=document.querySelector('.tb-icons-grid');if(iconsGrid){iconsGrid.addEventListener('click',async(e)=>{const item=e.target.closest('.tb-icon-item');if(!item)return;const label=item.querySelector('.tb-icon-label').textContent.trim();const theme=TB_ICON_THEMES[label];const charId=currentCheckPhoneTargetId;if(!charId||!theme)return;const confirmed=await showDialog({mode:'confirm',text:`进入【${label}】频道？\n这会刷新当前的商品推荐流。`});if(confirmed){triggerShoppingHomeGeneration(charId,null,theme)}})}
const searchBtn=document.querySelector('.tb-search-btn');const searchInput=document.querySelector('.tb-search-input');const handleTbSearch=async()=>{const charId=currentCheckPhoneTargetId;if(!charId)return;const keyword=searchInput.value.trim()||searchInput.placeholder;if(!keyword||keyword.includes('...')){await showDialog({mode:'alert',text:'请输入搜索关键词。'});return}
const confirmed=await showDialog({mode:'confirm',text:`确定要搜索 "${keyword}" 吗？\n这将刷新首页推荐流。`});if(confirmed){searchInput.value='';triggerShoppingHomeGeneration(charId,keyword)}};if(searchBtn){searchBtn.addEventListener('click',handleTbSearch)}
if(searchInput){searchInput.removeAttribute('readonly');searchInput.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();handleTbSearch()}})}
const navToProfile=document.getElementById('nav-to-profile');if(navToProfile){navToProfile.addEventListener('click',()=>{navigateTo('shoppingProfile');renderShoppingProfile()})}
const navToProfileFromCart=document.getElementById('nav-to-profile-from-cart');if(navToProfileFromCart){navToProfileFromCart.addEventListener('click',()=>{navigateTo('shoppingProfile');renderShoppingProfile()})}
const navToHomeFromProfile=document.getElementById('nav-to-home-from-profile');if(navToHomeFromProfile){navToHomeFromProfile.addEventListener('click',()=>{navigateTo('shoppingHome')})}
const navToCartFromProfile=document.getElementById('nav-to-cart-from-profile');if(navToCartFromProfile){navToCartFromProfile.addEventListener('click',()=>{const charId=currentCheckPhoneTargetId;if(charId){navigateTo('shopping');renderShoppingApp(charId)}})}
document.getElementById('cp-footprints-back-btn').addEventListener('click',()=>{navigateTo('checkPhone')});document.getElementById('cp-footprints-delete-btn').addEventListener('click',async()=>{const charId=currentCheckPhoneTargetId;if(!charId)return;const confirmed=await showDialog({mode:'confirm',text:'确定要删除今日的足迹记录吗？\n删除后重新进入即可自动生成新的。'});if(confirmed){blmxManager.logEntries=blmxManager.logEntries.filter(entry=>!(entry.type==='footprints'&&entry.author===charId));await blmxManager.persistLogToStorage();await showDialog({mode:'alert',text:'记录已删除。'});navigateTo('checkPhone')}});document.getElementById('cp-gallery-back-btn').addEventListener('click',()=>{navigateTo('checkPhone')});document.getElementById('cp-gallery-reset-btn').addEventListener('click',async()=>{const charId=currentCheckPhoneTargetId;if(!charId)return;const confirmed=await showDialog({mode:'confirm',text:'确定要清空“近期回忆”吗？\n\n注意：\n1. 仅清空主相册，不会删除隐藏相册和回收站。\n2. 清空后重新进入可触发AI生成新内容。'});if(confirmed){blmxManager.logEntries=blmxManager.logEntries.filter(entry=>{if(entry.type==='gallery_update'){if(entry.author===charId)return!1;if(entry.content&&entry.content.author===charId)return!1}
return!0});await blmxManager.persistLogToStorage();await showDialog({mode:'alert',text:'主相册已清空。'});renderGalleryApp(charId)}});const folderHidden=document.getElementById('folder-hidden');if(folderHidden){folderHidden.addEventListener('click',()=>{navigateTo('hiddenAlbum');Object.values(Views).forEach(v=>v.classList.remove('active'));document.getElementById('cp-hidden-album-view').classList.add('active');const charId=currentCheckPhoneTargetId;if(charId)renderHiddenAlbum(charId);})}
const folderTrash=document.getElementById('folder-trash');if(folderTrash){folderTrash.addEventListener('click',()=>{Object.values(Views).forEach(v=>v.classList.remove('active'));document.getElementById('cp-trash-bin-view').classList.add('active');const charId=currentCheckPhoneTargetId;if(charId)renderTrashBin(charId);})}
document.getElementById('cp-hidden-back-btn').addEventListener('click',()=>{navigateTo('gallery');if(currentCheckPhoneTargetId)renderGalleryApp(currentCheckPhoneTargetId);});document.getElementById('cp-trash-back-btn').addEventListener('click',()=>{navigateTo('gallery');if(currentCheckPhoneTargetId)renderGalleryApp(currentCheckPhoneTargetId);});document.getElementById('cp-trash-clear-all').addEventListener('click',async()=>{const confirmed=await showDialog({mode:'confirm',text:'确定要彻底清空所有废弃项目吗？'});if(confirmed){const charId=currentCheckPhoneTargetId;blmxManager.logEntries=blmxManager.logEntries.filter(e=>!(e.type==='trash_bin_update'&&e.author===charId));await blmxManager.persistLogToStorage();renderTrashBin(charId);await showDialog({mode:'alert',text:'垃圾桶已清空。'})}});const hiddenClearBtn=document.getElementById('cp-hidden-clear-btn');if(hiddenClearBtn){hiddenClearBtn.addEventListener('click',async()=>{const charId=currentCheckPhoneTargetId;if(!charId)return;const confirmed=await showDialog({mode:'confirm',text:'【警告】\n确定要清空隐藏相册的所有数据吗？此操作不可恢复。'});if(confirmed){blmxManager.logEntries=blmxManager.logEntries.filter(e=>!(e.type==='hidden_album_update'&&e.author===charId));await blmxManager.persistLogToStorage();renderHiddenAlbum(charId);await showDialog({mode:'alert',text:'隐藏空间已重置。'})}})}
if(window._blmxListenersAdded)return;window._blmxListenersAdded=!0;const globalImg=document.getElementById('global-image-viewer-img');if(globalImg){addLongPressListener(globalImg,(e)=>{e.stopPropagation();if(globalImg.src){window.downloadImage(globalImg.src)}})}
let globalLongPressTimer;let isLongPressHandled=!1;let isImageDownloadingLock=!1;const targetImageSelector='.nai-generated-image, .post-media-image, .image-url-bubble img';const clearLongPress=()=>clearTimeout(globalLongPressTimer);document.body.addEventListener('pointerup',clearLongPress);document.body.addEventListener('pointerleave',clearLongPress);document.body.addEventListener('pointercancel',clearLongPress);document.body.addEventListener('click',(e)=>{if(e.target.matches(targetImageSelector)){e.stopPropagation();if(isLongPressHandled||isImageDownloadingLock){return}
openImageViewer(e.target.src)}},!0);const hubTextEl=document.querySelector('.widget-custom-text');if(hubTextEl){hubTextEl.addEventListener('click',async()=>{const currentText=hubTextEl.textContent;const newText=await showDialog({mode:'prompt',text:'设置主屏幕自定义短语:',defaultValue:currentText});if(newText!==null){const textToSave=newText.trim()||"风吹向海 我吹响自由";hubTextEl.textContent=textToSave;localStorage.setItem(`blmx_hub_custom_text_${currentCharId}`,textToSave);await showDialog({mode:'alert',text:'短语已更新！'})}})}
document.getElementById('app-listen-together').addEventListener('click',()=>{navigateTo('listenTogether')});document.getElementById('lt-back-btn').addEventListener('click',()=>{navigateTo('home')});document.getElementById('lt-center-stage').addEventListener('click',function(){this.classList.toggle('show-lyrics')});document.getElementById('lt-options-btn').addEventListener('click',()=>{handleEditSongInfo()});document.getElementById('lt-char-avatar').addEventListener('click',()=>{handleSelectListenPartner()});const shareBtn=document.querySelector('.lt-action-bar .fa-share-alt');if(shareBtn){shareBtn.addEventListener('click',async()=>{const musicData={title:currentSong.title,artist:currentSong.artist,cover:userProfile.avatar||'https://files.catbox.moe/bialj8.jpeg',src:currentSong.src,lrc:currentSong.lrc};showForwardTargetModal(musicData,'shareMusic')})}
const playlistBtn=document.querySelector('.lt-action-bar .fa-download');const playlistOverlay=document.getElementById('lt-playlist-overlay');const playlistCloseBtn=document.getElementById('lt-playlist-close-btn');const addToPlaylistBtn=document.getElementById('lt-add-to-playlist-btn');if(playlistBtn&&playlistOverlay){playlistBtn.addEventListener('click',()=>{renderGlobalPlaylistUI();playlistOverlay.style.display='flex';setTimeout(()=>{playlistOverlay.style.opacity='1'},10)});playlistCloseBtn.addEventListener('click',()=>{playlistOverlay.style.opacity='0';setTimeout(()=>{playlistOverlay.style.display='none'},300)});playlistOverlay.addEventListener('click',(e)=>{if(e.target===playlistOverlay){playlistOverlay.style.opacity='0';setTimeout(()=>{playlistOverlay.style.display='none'},300)}});addToPlaylistBtn.addEventListener('click',async()=>{if(!currentSong||!currentSong.src){await showDialog({mode:'alert',text:'当前没有正在播放的歌曲。'});return}
const success=await addToGlobalPlaylist(currentSong);if(success){await showDialog({mode:'alert',text:`《${currentSong.title}》已加入歌单！`});renderGlobalPlaylistUI()}})}
document.getElementById('lt-mode-btn').addEventListener('click',toggleMusicLoopMode);document.getElementById('lt-prev-btn').addEventListener('click',()=>{switchSong('prev',!1)});document.getElementById('lt-next-btn').addEventListener('click',()=>{switchSong('next',!1)});const playlistToggleBtn=document.getElementById('lt-playlist-toggle-btn');if(playlistToggleBtn){playlistToggleBtn.addEventListener('click',()=>{renderGlobalPlaylistUI()})}
const musicLikeBtn=document.querySelector('.lt-action-bar .fa-heart');if(musicLikeBtn){musicLikeBtn.addEventListener('click',function(){if(this.classList.contains('far')){this.classList.replace('far','fas');this.style.color='#E14438';this.style.transform='scale(1.2)';setTimeout(()=>{this.style.transform='scale(1)'},200)}else{this.classList.replace('fas','far');this.style.color=''}})}
const commentBtn=document.querySelector('.lt-action-bar .fa-comment-dots');const inputOverlay=document.getElementById('lt-input-overlay');const chatInput=document.getElementById('lt-chat-input');const chatSendBtn=document.getElementById('lt-chat-send-btn');const closeTrigger=document.getElementById('lt-input-close-trigger');if(commentBtn){commentBtn.addEventListener('click',()=>{inputOverlay.style.display='flex';chatInput.focus()})}
closeTrigger.addEventListener('click',()=>{inputOverlay.style.display='none'});chatSendBtn.addEventListener('click',handleListenTogetherSend);chatInput.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();handleListenTogetherSend()}});const playPauseBtn=document.getElementById('lt-play-pause-btn');const vinylEl=document.getElementById('lt-vinyl-container');const vinylView=document.getElementById('lt-vinyl-view');playPauseBtn.addEventListener('click',()=>{if(globalAudio.paused){globalAudio.play();playPauseBtn.className='fas fa-pause-circle';vinylEl.classList.add('playing');vinylView.classList.add('playing')}else{globalAudio.pause();playPauseBtn.className='fas fa-play-circle';vinylEl.classList.remove('playing');vinylView.classList.remove('playing')}});const slider=document.getElementById('lt-progress-slider');slider.addEventListener('mousedown',()=>isDraggingProgress=!0);slider.addEventListener('touchstart',()=>isDraggingProgress=!0);slider.addEventListener('input',()=>{const duration=globalAudio.duration||0;const targetTime=(slider.value/100)*duration;document.getElementById('lt-current-time').textContent=formatTime(targetTime)});const handleSeek=()=>{isDraggingProgress=!1;const duration=globalAudio.duration||0;if(duration>0){const targetTime=(slider.value/100)*duration;globalAudio.currentTime=targetTime}};slider.addEventListener('change',handleSeek);slider.addEventListener('touchend',handleSeek);const historyBtn=document.querySelector('.lt-controls .fa-list-ul');const historyView=document.getElementById('lt-history-view');if(historyBtn&&historyView){historyBtn.addEventListener('click',()=>{const isActive=historyView.classList.toggle('active');if(isActive){renderListenTogetherHistory();historyBtn.style.color='var(--wechat-green-icon)'}else{historyBtn.style.color=''}});historyView.addEventListener('click',(e)=>{if(e.target===historyView){historyView.classList.remove('active');historyBtn.style.color=''}})}
let inCallUserMessageQueue=[];const cancelCallBtn=document.getElementById('cancel-call-btn');const endCallBtn=document.getElementById('end-call-btn');const inCallSendBtn=document.getElementById('in-call-send-btn');const inCallInput=document.getElementById('in-call-input');const sharedScreenEl=document.getElementById('call-shared-screen');const inCallHeaderEl=document.querySelector('.in-call-header');sharedScreenEl.addEventListener('click',(e)=>{e.stopPropagation();sharedScreenEl.style.opacity='0';sharedScreenEl.style.pointerEvents='none'});inCallHeaderEl.addEventListener('click',()=>{if(sharedScreenEl.style.opacity==='0'){sharedScreenEl.style.opacity='1';sharedScreenEl.style.pointerEvents='auto'}});function updateInCallButtonUI(){const text=inCallInput.value.trim();const hasDrafts=inCallUserMessageQueue.length>0;if(isGenerating){inCallSendBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i>';inCallSendBtn.disabled=!0;inCallSendBtn.style.backgroundColor='rgba(255,255,255,0.3)'}else if(text.length>0){inCallSendBtn.innerHTML='<i class="fas fa-paper-plane"></i>';inCallSendBtn.disabled=!1;inCallSendBtn.style.backgroundColor='rgba(255,255,255,0.3)'}else if(hasDrafts){inCallSendBtn.innerHTML='<i class="fas fa-arrow-up"></i>';inCallSendBtn.disabled=!1;inCallSendBtn.style.backgroundColor='rgba(255,255,255,0.3)'}else{inCallSendBtn.innerHTML='<i class="fas fa-paper-plane"></i>';inCallSendBtn.disabled=!0;inCallSendBtn.style.backgroundColor='rgba(255,255,255,0.3)'}}
async function triggerInCallAiResponse(){if(inCallUserMessageQueue.length===0||isGenerating)return;isGenerating=!0;updateFooterButtonsState();updateInCallButtonUI();try{const log=document.getElementById('chat-simulation-log');const recentMessages=Array.from(log.querySelectorAll('.chat-simulation-message')).slice(0,5).reverse().map(el=>{const prefix=el.classList.contains('me')?'{{user}}':callPartner.name;return `${prefix}: ${el.textContent}`}).join('\n');const queuedMessages=inCallUserMessageQueue.map(msg=>`{{user}}: ${msg}`).join('\n');const fullHistory=recentMessages+'\n'+queuedMessages;inCallUserMessageQueue=[];const currentSceneDescription=sharedScreenEl.querySelector('.screen-description')?.textContent||'画面中空无一物。';const contextForAI=getInCallContextForAI(callPartner.id,fullHistory,currentSceneDescription);latestPromptSentToAI=contextForAI;const rawResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1});latestAiRawResponse=rawResponse.trim();let cleanedResponse=rawResponse.trim().replace(/^```json\n?|```\n?$/g,'').trim();let responseLines=cleanedResponse.split('\n').map(line=>line.trim().replace(/^`|`$/g,''));for(const line of responseLines){if(!line)continue;const commandRegex=/UPDATE_CALL_SCREEN:({.*})/;const match=line.match(commandRegex);if(match){try{const data=JSON.parse(match[1]);handleUpdateCallScreen(data)}catch(e){console.error("[Call Parser] Failed to parse UPDATE_CALL_SCREEN JSON:",e,match[1])}}else if(line.startsWith('END_CALL:')){try{const jsonStr=line.substring('END_CALL:'.length);const data=JSON.parse(jsonStr);if(data.ender){await showDialog({mode:'alert',text:`${getDisplayName(data.ender, null)} 挂断了通话。`});endCurrentCall();return}}catch(e){}}else if(line.startsWith('(You say):')){}else{const replyEl=document.createElement('div');replyEl.className='chat-simulation-message';replyEl.textContent=line;log.insertBefore(replyEl,log.firstChild)}
const delay=Math.random()*1000+1500;await new Promise(resolve=>setTimeout(resolve,delay))}}catch(error){console.error('[Call AI] AI response failed:',error);const log=document.getElementById('chat-simulation-log');const errorEl=document.createElement('div');errorEl.className='chat-simulation-message';errorEl.textContent='(对方似乎信号不太好...)';log.insertBefore(errorEl,log.firstChild)}finally{isGenerating=!1;updateFooterButtonsState();updateInCallButtonUI()}}
function handleInCallSend(){const text=inCallInput.value.trim();const log=document.getElementById('chat-simulation-log');if(text){const msgEl=document.createElement('div');msgEl.className='chat-simulation-message me';msgEl.textContent=text;log.insertBefore(msgEl,log.firstChild);inCallUserMessageQueue.push(text);inCallInput.value='';inCallInput.focus();updateInCallButtonUI()}else{triggerInCallAiResponse()}}
inCallSendBtn.addEventListener('click',handleInCallSend);inCallInput.addEventListener('input',updateInCallButtonUI);inCallInput.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleInCallSend()}});cancelCallBtn.addEventListener('click',()=>{inCallUserMessageQueue=[];endCurrentCall()});endCallBtn.addEventListener('click',()=>{inCallUserMessageQueue=[];endCurrentCall()});document.getElementById('call-screen-prev-btn').addEventListener('click',()=>{if(currentScreenIndex>0){currentScreenIndex--;renderCallScreen()}});document.getElementById('call-screen-next-btn').addEventListener('click',()=>{if(currentScreenIndex<callScreenHistory.length-1){currentScreenIndex++;renderCallScreen()}});document.getElementById('accept-call-btn').addEventListener('click',handleAcceptCall);document.getElementById('decline-call-btn').addEventListener('click',handleDeclineCall);document.getElementById('forum-profile-view').addEventListener('click',async function(e){const view=document.getElementById('forum-profile-view');const profileNameEl=view.querySelector('.profile-name');const profileName=profileNameEl?profileNameEl.textContent:null;const profileData=findContactByAnyName(profileName);const backBtn=e.target.closest('.header .fa-arrow-left');if(backBtn){if(profileData&&(profileData.id==='user'||profileData.id==='{{user}}')){navigateTo('weibo')}else{const detailView=document.getElementById('weibo-detail-view');const lastPostId=detailView?detailView.dataset.postId:null;if(lastPostId){navigateTo('weiboDetail',{postId:lastPostId})}else{navigateTo('weibo')}}
return}
const tabItem=e.target.closest('.tab-item');if(tabItem){if(tabItem.classList.contains('active'))return;const tabName=tabItem.dataset.tab;const isViewingOwnProfile=profileData&&(profileData.id==='user'||profileData.id==='{{user}}');if(tabName==='posts'&&!isViewingOwnProfile){const postsContainer=document.getElementById('profile-tab-posts');if(postsContainer.children.length===1&&postsContainer.querySelector('p')){e.preventDefault();const confirmed=await showDialog({mode:'confirm',text:`TA的主页空空如也，是否要催更一下，让 ${profileName} 发布几篇新动态？`});if(confirmed){await handleTriggerProfilePostCreation(profileData.id)}}}
const tabsContainer=tabItem.parentElement;const contentContainer=tabsContainer.nextElementSibling;tabsContainer.querySelectorAll('.tab-item').forEach(tab=>tab.classList.remove('active'));contentContainer.querySelectorAll('.profile-tab-content > div').forEach(content=>content.classList.remove('active'));tabItem.classList.add('active');document.getElementById('profile-tab-'+tabName).classList.add('active');return}
const postCard=e.target.closest('#profile-tab-posts .post-card');if(postCard){const postId=postCard.dataset.postId;if(postId){navigateTo('weiboDetail',{postId:postId});renderWeiboDetail(postId)}
return}
const postLink=e.target.closest('.post-link');if(postLink){const postId=postLink.dataset.postId;if(postId){navigateTo('weiboDetail',{postId:postId});renderWeiboDetail(postId)}
return}
const askButton=e.target.closest('.ama-input-box button');if(askButton){if(isGenerating){await showDialog({mode:'alert',text:'AI正在思考中，请稍后再问。'});return}
if(!profileData)return;const qnaListContainer=view.querySelector('.ama-qna-list');const textarea=view.querySelector('.ama-input-box textarea');const question=textarea.value.trim();if(!question){await showDialog({mode:'alert',text:'问题内容不能为空。'});return}
isGenerating=!0;askButton.innerHTML='<i class="fas fa-spinner fa-spin"></i>';askButton.disabled=!0;try{const contextForAI=getAmaAnswerContextForAI(profileData.id,question);if(!contextForAI)throw new Error("无法为AI生成有效的上下文。");latestPromptSentToAI=contextForAI;const rawResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1});latestAiRawResponse=rawResponse.trim();const answerMatch=latestAiRawResponse.match(/AMA_ANSWER:({.*})/);if(answerMatch){const answerData=JSON.parse(answerMatch[1]);const answerText=answerData.answer;const amaPairData={key:'AMA_PAIR',data:{author:profileData.id,question:question,answer:answerText,timestamp:new Date().toISOString()}};blmxManager.addEntry(amaPairData);await blmxManager.persistLogToStorage();const qnaCard=document.createElement('div');qnaCard.className='qna-card';qnaCard.innerHTML=`
					<div class="question"><p>${question.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p></div>
					<div class="answer">
						<div class="answer-content">
							<p class="author">${getDisplayName(profileData.id, null)}</p>
							<p>${answerText.replace(/\n/g, '<br>')}</p>
						</div>
					</div>
				`;qnaListContainer.prepend(qnaCard);textarea.value=''}else{await showDialog({mode:'alert',text:'AI未能给出有效的内心独白，请稍后再试。'})}}catch(error){console.error("[AMA AI Call] Failed:",error);await showDialog({mode:'alert',text:`AI响应失败: ${error.message}`})}finally{isGenerating=!1;askButton.innerHTML='<i class="fas fa-paper-plane"></i>';askButton.disabled=!1}
return}
const viewMoreBtn=e.target.closest('#view-more-ama-btn');if(viewMoreBtn){if(!profileData)return;const confirmed=await showDialog({mode:'confirm',text:`是否要对 ${profileName} 进行一次“灵魂叩问”？\n(这将消耗一次API调用)`});if(confirmed){const qnaListContainer=document.getElementById('profile-tab-ama').querySelector('.ama-qna-list');isGenerating=!0;viewMoreBtn.textContent='思考中...';try{const context=getAmaContextForAI(profileData.id);latestPromptSentToAI=context;const rawResponse=await tavernGenerateFunc({user_input:context,should_stream:!1});latestAiRawResponse=rawResponse.trim();const amaRegex=/^AMA_PAIR:(.*)$/gm;let match;const newEntriesToLog=[];while((match=amaRegex.exec(rawResponse))!==null){try{const qnaData=JSON.parse(match[1]);if(qnaData.question&&qnaData.answer){newEntriesToLog.push({key:'AMA_PAIR',data:{author:profileData.id,question:qnaData.question,answer:qnaData.answer,timestamp:new Date().toISOString()}})}}catch(e){}}
if(newEntriesToLog.length>0){newEntriesToLog.forEach(entry=>blmxManager.addEntry(entry));await blmxManager.persistLogToStorage();await renderForumProfile(profileData.id)}else{qnaListContainer.innerHTML='<p style="text-align:center; color: var(--forum-text-secondary); padding: 1rem;">AI未能生成有效的问答内容，请稍后再试。</p>'}}catch(error){console.error("[AMA AI Call] Failed:",error);await showDialog({mode:'alert',text:`AI响应失败: ${error.message}`})}finally{isGenerating=!1;const newViewMoreBtn=document.getElementById('view-more-ama-btn');if(newViewMoreBtn)newViewMoreBtn.textContent='🔍 查看更多'}}}});document.getElementById('forum-nav-profile').addEventListener('click',()=>{navigateTo('forumProfile',{contactId:'user'})});addLongPressListener(wechatBody,(e)=>{const messageRow=e.target.closest('.message-row');if(messageRow&&!document.getElementById('wechat-chat-view').classList.contains('delete-mode')){showQuoteContextMenu(messageRow,e)}},{duration:500});document.getElementById('app-font-studio').addEventListener('click',()=>{navigateTo('fontStudio')});document.getElementById('font-studio-back-btn').addEventListener('click',()=>{navigateTo('home')});document.getElementById('font-studio-save-btn').addEventListener('click',()=>{applyAndSaveCustomFont()});document.getElementById('font-studio-reset-btn').addEventListener('click',()=>{resetDefaultFont()});document.getElementById('font-url-apply-btn').addEventListener('click',async()=>{const urlInput=document.getElementById('font-url-input');const url=urlInput.value.trim();if(!url){await showDialog({mode:'alert',text:'请输入字体链接！'});return}
const fontName=`CustomFont_${Date.now()}`;const cssCode=`
@font-face {
font-family: '${fontName}';
src: url('${url}') format('truetype');
font-weight: normal;
font-style: normal;
}
body {
font-family: '${fontName}', sans-serif;
}
`;document.getElementById('font-css-input').value=cssCode.trim();applyAndSaveCustomFont()});document.getElementById('export-theme-btn').addEventListener('click',(e)=>{e.preventDefault();exportTheme()});document.getElementById('import-theme-btn').addEventListener('click',(e)=>{e.preventDefault();importTheme()});const bubbleWorkshopView=document.getElementById('bubble-workshop-view');bubbleWorkshopView.addEventListener('click',async(e)=>{const target=e.target;const workshopView=bubbleWorkshopView;const header=target.closest('.collapsible-header');if(header&&!workshopView.classList.contains('is-locked')){const group=header.closest('.studio-control-group.collapsible');if(group){group.classList.toggle('active')}
return}
if(target.id==='bubble-workshop-load-btn'){loadBubbleStyles();if(workshopView.classList.contains('is-locked')){workshopView.classList.remove('is-locked');await showDialog({mode:'alert',text:'编辑已激活！您可以开始自定义气泡了。'})}
return}
if(workshopView.classList.contains('is-locked')){e.stopPropagation();e.preventDefault();await showDialog({mode:'alert',text:'请先点击“载入当前”以激活编辑功能。'});return}
if(target.id==='sync-me-to-them-btn'){const confirmed=await showDialog({mode:'confirm',text:'确定要用【我的气泡】样式覆盖【对方气泡】吗？此操作不可撤销。'});if(confirmed){const myStyles=getBubbleStylesAsObject('me');applyBubbleStylesFromObject(myStyles,'them');if(document.querySelector('input[name="bubble-target"]:checked').value==='them'){loadBubbleStyles()}
await showDialog({mode:'alert',text:'同步成功！'})}
return}
if(target.id==='sync-them-to-me-btn'){const confirmed=await showDialog({mode:'confirm',text:'确定要用【对方气泡】样式覆盖【我的气泡】吗？此操作不可撤销。'});if(confirmed){const themStyles=getBubbleStylesAsObject('them');applyBubbleStylesFromObject(themStyles,'me');if(document.querySelector('input[name="bubble-target"]:checked').value==='me'){loadBubbleStyles()}
await showDialog({mode:'alert',text:'同步成功！'})}
return}
if(target.id==='bubble-workshop-save-btn'){if(saveBubbleStyles()){await showDialog({mode:'alert',text:'气泡样式已成功保存！'})}else{await showDialog({mode:'alert',text:'保存失败，详情请查看控制台。'})}
return}
if(target.id==='bubble-workshop-reset-btn'){const confirmed=await showDialog({mode:'confirm',text:'确定要恢复到默认样式吗？\n您当前保存的自定义主题将被清除。'});if(confirmed){const storageKey=`blmx_bubble_theme_${currentCharId}`;localStorage.removeItem(storageKey);await showDialog({mode:'alert',text:'已恢复默认设置。应用即将刷新以应用更改...'});location.reload()}
return}});const targetSelectors=bubbleWorkshopView.querySelectorAll('input[name="bubble-target"]');targetSelectors.forEach(radio=>{radio.addEventListener('change',()=>{loadBubbleStyles()})});const controlsContainer=document.getElementById('bubble-controls-container');if(controlsContainer){controlsContainer.addEventListener('input',(e)=>{if(e.target.name==='bubble-target')return;if(!bubbleWorkshopView.classList.contains('is-locked')){handleBubbleControlChange(e)}});controlsContainer.addEventListener('change',(e)=>{if(e.target.name==='bubble-target')return;if(!bubbleWorkshopView.classList.contains('is-locked')){handleBubbleControlChange(e)}})}
document.getElementById('app-bubble-workshop').addEventListener('click',()=>{navigateTo('bubbleWorkshop');renderBubblePreview();renderBubbleWorkshopControls();document.getElementById('bubble-workshop-view').classList.add('is-locked')});document.getElementById('bubble-workshop-back-btn').addEventListener('click',()=>{navigateTo('home')});document.getElementById('app-global-studio').addEventListener('click',()=>{navigateTo('globalDesignStudio');renderThemeEditor()});document.getElementById('studio-back-btn').addEventListener('click',()=>{navigateTo('home')});document.getElementById('studio-body').addEventListener('input',(e)=>{const target=e.target;const variableName=target.dataset.variable;const pickerFor=target.dataset.variablePickerFor;if(variableName){if(target.type==='range'){const config=globalThemeVariableMap[variableName];const unit=(config&&config.unit)?config.unit:'';const cssValue=target.value+unit;document.documentElement.style.setProperty(variableName,cssValue);if(target.nextElementSibling&&target.nextElementSibling.classList.contains('range-value')){target.nextElementSibling.textContent=cssValue}}else if(target.dataset.type==='imageUrl'){const cssValue=target.value.trim()?`url('${target.value.trim()}')`:'none';document.documentElement.style.setProperty(variableName,cssValue)}else{let hex8Value=target.value.trim();const rgbaObj=hexToRgba(hex8Value);if(rgbaObj){const rgbaString=`rgba(${rgbaObj.r}, ${rgbaObj.g}, ${rgbaObj.b}, ${rgbaObj.a})`;document.documentElement.style.setProperty(variableName,rgbaString);const controls=target.closest('.studio-color-controls');if(controls){const colorPicker=controls.querySelector(`[data-variable-picker-for="${variableName}"]`);const previewBox=controls.querySelector('.color-preview');if(colorPicker){colorPicker.value='#'+(hex8Value.substring(1,7)||'000000')}
if(previewBox){previewBox.style.backgroundColor=rgbaString}}}}}else if(pickerFor){const hexInput=document.querySelector(`.hex-input[data-variable="${pickerFor}"]`);if(hexInput){const newColor=target.value;const currentAlphaHex=hexInput.value.substring(7,9)||'ff';const newHex8Value=newColor+currentAlphaHex;hexInput.value=newHex8Value;hexInput.dispatchEvent(new Event('input',{bubbles:!0}))}}});document.getElementById('studio-save-btn').addEventListener('click',async()=>{const theme={};const inputs=document.querySelectorAll('#studio-body input[data-variable]');inputs.forEach(input=>{const variableName=input.dataset.variable;let value=input.value.trim();const config=globalThemeVariableMap[variableName];if(config&&config.type==='range'&&config.unit){if(!value.endsWith(config.unit)){value+=config.unit}}
theme[variableName]=value});localStorage.setItem(`blmx_global_theme_${currentCharId}`,JSON.stringify(theme));applyCustomAppIcons();await showDialog({mode:'alert',text:'全局主题已成功保存！'})});document.getElementById('studio-reset-btn').addEventListener('click',async()=>{const confirmed=await showDialog({mode:'confirm',text:'确定要恢复到默认主题吗？\n您当前保存的自定义主题将被清除。'});if(confirmed){localStorage.removeItem(`blmx_global_theme_${currentCharId}`);location.reload()}});const navMap={'nav-wechat':'wechatList','nav-wechat-from-contacts':'wechatList','nav-wechat-from-me':'wechatList','nav-contacts':'contacts','nav-contacts-from-contacts':'contacts','nav-contacts-from-me':'contacts','nav-me':'me','nav-me-from-contacts':'me','nav-me-from-me':'me'};document.querySelector('.phone-screen').addEventListener('click',(e)=>{const navButton=e.target.closest('.nav-item');if(navButton&&navMap[navButton.id]){navigateTo(navMap[navButton.id]);if(navMap[navButton.id]==='contacts'){renderContactsList()}}});document.getElementById('block-contact-btn').addEventListener('click',(e)=>{const contactId=document.getElementById('contact-details-profile-card').dataset.contactId;if(contactId){handleBlockContact(contactId)}});document.getElementById('contacts-list-container').addEventListener('click',(e)=>{const contactItem=e.target.closest('.conversation-item');if(contactItem){const contactId=contactItem.dataset.contactId;if(!contactId)return;let conversation=conversations.find(c=>c.type==='single'&&c.members.includes(contactId));if(!conversation){const newConversation={id:`convo_single_${contactId}`,type:'single',members:['user',contactId],unread:0,pinned:!1,lastActivity:Date.now()};conversations.push(newConversation);saveData();conversation=newConversation}
navigateTo('wechatChat',{conversationId:conversation.id})}});document.getElementById('app-wechat').addEventListener('click',()=>navigateTo('wechatList'));document.getElementById('app-settings').addEventListener('click',()=>navigateTo('settings'));document.getElementById('app-weibo').addEventListener('click',()=>navigateTo('weibo'));document.getElementById('weibo-back-btn').addEventListener('click',()=>navigateTo('home'));document.getElementById('weibo-feed-back-btn').addEventListener('click',()=>navigateTo('weibo'));document.getElementById('weibo-settings-btn').addEventListener('click',async()=>{const currentIdentity=getAnonymousIdentity()||{name:'',avatar:''};const result=await showMultiInputDialog({title:'论坛设置',fields:[{id:'name',label:'马甲昵称',defaultValue:currentIdentity.name},{id:'avatar',label:'马甲头像 URL',defaultValue:currentIdentity.avatar},{id:'darkMode',label:'夜间模式 (仅论坛)',type:'switch',defaultValue:document.getElementById('weibo-view').classList.contains('forum-dark-mode')||document.getElementById('forum-profile-view').classList.contains('forum-dark-mode')},{id:'fontSize',label:'详情页字体',type:'slider',min:0.7,max:1.2,step:0.05,unit:'em',defaultValue:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--forum-font-size'))||0.9}]});if(result!==null){if(result.name.trim()===''&&result.avatar.trim()===''){localStorage.removeItem(`blmx_weibo_anonymous_identity_${currentCharId}`)}else{saveAnonymousIdentity({name:result.name,avatar:result.avatar})}
const isDarkMode=result.darkMode;const forumViews=[document.getElementById('weibo-view'),document.getElementById('weibo-feed-view'),document.getElementById('weibo-detail-view'),document.getElementById('forum-profile-view')];forumViews.forEach(view=>{if(view){view.classList.toggle('forum-dark-mode',isDarkMode)}});const themeMode=isDarkMode?'dark':'light';localStorage.setItem(`blmx_forum_theme_${currentCharId}`,themeMode);const newFontSize=result.fontSize;document.documentElement.style.setProperty('--forum-font-size',`${newFontSize}em`);localStorage.setItem(`blmx_forum_font_size_${currentCharId}`,newFontSize);await showDialog({mode:'alert',text:'设置已保存！'})}});document.getElementById('weibo-detail-back-btn').addEventListener('click',()=>{const detailView=document.getElementById('weibo-detail-view');const postId=detailView.dataset.currentPostId;if(postId){const changed=markWeiboCommentsAsRead(postId);if(changed){blmxManager.persistLogToStorage()}}
const post=weiboData.posts.find(p=>p.postId===postId);if(post&&post.category){const zoneCard=document.querySelector(`.weibo-zone-card[data-category="${post.category}"]`);const categoryName=zoneCard?zoneCard.querySelector('.zone-title').textContent:'帖子列表';navigateTo('weiboFeed',{category:post.category,categoryName:categoryName});renderWeiboFeed(post.category)}else{navigateTo('weibo')}});document.getElementById('app-diary').addEventListener('click',()=>navigateTo('diary'));document.getElementById('diary-back-btn').addEventListener('click',()=>navigateTo('home'));document.getElementById('diary-select-owner-btn').addEventListener('click',async(e)=>{e.stopPropagation();const selectedOwnerId=await showDiaryOwnerSelectionModal();if(selectedOwnerId){const ownerNameEl=document.getElementById('diary-owner-name');document.querySelector('.diary-cover').dataset.ownerId=selectedOwnerId;ownerNameEl.textContent=getDisplayName(selectedOwnerId,null);ownerNameEl.classList.remove('sticker-placeholder');await showDialog({mode:'alert',text:`已选择查看 ${ownerNameEl.textContent} 的日记。`})}});document.querySelector('.diary-cover').addEventListener('click',()=>{const ownerId=document.querySelector('.diary-cover').dataset.ownerId;if(!ownerId){showDialog({mode:'alert',text:'请先通过“选择”按钮指定一位日记主人！'});return}
navigateTo('diaryEntry',{ownerId:ownerId})});document.getElementById('diary-entry-back-btn').addEventListener('click',()=>{navigateTo('diary')});document.getElementById('diary-create-entry-btn').addEventListener('click',async()=>{if(isGenerating){await showDialog({mode:'alert',text:'AI正在生成中，请稍后再试。'});return}
const ownerId=document.getElementById('diary-entry-view').dataset.ownerId;if(!ownerId){await showDialog({mode:'alert',text:'错误：找不到日记主人信息。'});return}
const ownerName=getDisplayName(ownerId,null);const confirmed=await showDialog({mode:'confirm',text:`是否要探寻一下 ${ownerName} 此刻的心事，并让Ta记录下来？`});if(confirmed){await showDialog({mode:'alert',text:`正在探寻 ${ownerName} 的心事，请稍候...`});await triggerAiDiaryCreation(ownerId)}});document.getElementById('diary-change-bg-btn').addEventListener('click',async()=>{const ownerId=document.getElementById('diary-entry-view').dataset.ownerId;if(!ownerId){await showDialog({mode:'alert',text:'错误：找不到日记主人信息。'});return}
const owner=contacts.find(c=>c.id===ownerId);if(!owner){console.error("Error: Cannot find contact object for ownerId:",ownerId);return}
const newUrl=await showDialog({mode:'prompt',text:`为 ${getDisplayName(owner.id, null)} 的日记设置背景图URL：\n（留空则恢复默认）`,defaultValue:owner.diaryWallpaper||''});if(newUrl!==null){owner.diaryWallpaper=newUrl.trim()||undefined;saveData();applyDiaryBackground(ownerId);await showDialog({mode:'alert',text:'背景已更新！'})}});document.getElementById('diary-delete-entry-btn').addEventListener('click',async(e)=>{if(e.currentTarget.classList.contains('disabled'))return;const view=document.getElementById('diary-entry-view');const entryIndex=parseInt(view.dataset.viewingIndex,10);const ownerId=view.dataset.ownerId;if(isNaN(entryIndex)||entryIndex<0){await showDialog({mode:'alert',text:'当前没有可删除的日记。'});return}
const confirmed=await showDialog({mode:'confirm',text:'确定要永久删除这篇日记吗？此操作不可撤销。'});if(confirmed){blmxManager.logEntries.splice(entryIndex,1);await blmxManager.persistLogToStorage();await showDialog({mode:'alert',text:'日记已删除。'});navigateTo('diaryEntry',{ownerId:ownerId})}});document.getElementById('diary-prev-btn').addEventListener('click',(e)=>{if(e.currentTarget.classList.contains('disabled'))return;const view=document.getElementById('diary-entry-view');const ownerId=view.dataset.ownerId;const viewingIndex=parseInt(view.dataset.viewingIndex,10);const ownerEntries=blmxManager.logEntries.map((entry,index)=>({...entry,originalIndex:index})).filter(entry=>entry.key==='DIARY_ENTRY'&&entry.data.author===ownerId).sort((a,b)=>new Date(b.data.timestamp)-new Date(a.data.timestamp));const currentIndexInList=ownerEntries.findIndex(entry=>entry.originalIndex===viewingIndex);if(currentIndexInList>0){const prevEntry=ownerEntries[currentIndexInList-1];renderDiaryEntry(prevEntry.originalIndex)}});document.getElementById('diary-next-btn').addEventListener('click',(e)=>{if(e.currentTarget.classList.contains('disabled'))return;const view=document.getElementById('diary-entry-view');const ownerId=view.dataset.ownerId;const viewingIndex=parseInt(view.dataset.viewingIndex,10);const ownerEntries=blmxManager.logEntries.map((entry,index)=>({...entry,originalIndex:index})).filter(entry=>entry.key==='DIARY_ENTRY'&&entry.data.author===ownerId).sort((a,b)=>new Date(b.data.timestamp)-new Date(a.data.timestamp));const currentIndexInList=ownerEntries.findIndex(entry=>entry.originalIndex===viewingIndex);if(currentIndexInList<ownerEntries.length-1){const nextEntry=ownerEntries[currentIndexInList+1];renderDiaryEntry(nextEntry.originalIndex)}});addLongPressListener(document.querySelector('.diary-entry-body'),()=>{const diaryView=document.getElementById('diary-entry-view');const areIconsHidden=diaryView.classList.toggle('icons-hidden');localStorage.setItem('blmx_diary_icons_hidden',areIconsHidden)},{duration:800});document.getElementById('soft-reset-btn').addEventListener('click',(e)=>{e.preventDefault();handleSoftReset()});document.getElementById('hard-reset-btn').addEventListener('click',(e)=>{e.preventDefault();handleHardReset()});document.getElementById('summarize-and-clear-btn').addEventListener('click',async(e)=>{e.preventDefault();const confirmed=await showDialog({mode:'confirm',text:'确定要让AI总结并存档所有历史记录吗？\n\n此操作将永久清除所有详细聊天、朋友圈和微博记录，仅保留一段AI生成的摘要。此操作不可撤销！'});if(confirmed){await triggerAiSummaryAndClear()}});document.getElementById('weibo-view').addEventListener('click',async(e)=>{const snapshotBtn=e.target.closest('#forum-nav-snapshot');if(snapshotBtn){handleTriggerWorldSnapshot();return}
const card=e.target.closest('.weibo-zone-card');if(!card||!card.dataset.category){return}
const viewConfirmed=await showDialog({mode:'confirm',text:`是否要查看【${card.querySelector('.zone-title').textContent}】分区？`});if(!viewConfirmed){return}
const category=card.dataset.category;const categoryName=card.querySelector('.zone-title').textContent;const existingPosts=weiboData.posts.filter(p=>p.category===category);if(existingPosts.length>0){renderWeiboFeed(category);navigateTo('weiboFeed',{category,categoryName})}else{await triggerInitialFeedGeneration(category);renderWeiboFeed(category);navigateTo('weiboFeed',{category,categoryName})}});document.getElementById('forum-nav-add').addEventListener('click',()=>{showAddZoneCenter()});document.getElementById('weibo-feed-view').addEventListener('click',async(e)=>{if(e.target.id==='weibo-create-post-btn'){handleCreateWeiboPost();return}
const deleteBtn=e.target.closest('.thread-delete-btn');if(deleteBtn){e.stopPropagation();const card=deleteBtn.closest('.forum-thread-item-card');const postId=card.dataset.postId;const confirmed=await showDialog({mode:'confirm',text:'确定要删除这条帖子吗？此操作不可恢复。'});if(confirmed){await handleDeletePost(postId)}
return}
const threadItem=e.target.closest('.forum-thread-item-card');if(threadItem){const postId=threadItem.dataset.postId;const post=weiboData.posts.find(p=>p.postId===postId);if(!post)return;post.isRead=!0;const logEntry=blmxManager.logEntries.find(e=>e.key==='WEIBO_POST'&&e.data.postId===postId);if(logEntry){logEntry.data.isRead=!0}
const star=threadItem.querySelector('.thread-read-star');if(star){star.classList.add('read');star.title='已读'}
if(!post.text&&!post.content){await triggerFullPostGeneration(postId);navigateTo('weiboDetail',{postId,category:post.category});renderWeiboDetail(postId)}else{navigateTo('weiboDetail',{postId,category:post.category});renderWeiboDetail(postId);const commentsExist=weiboData.comments[postId]&&weiboData.comments[postId].length>0;if(!commentsExist){await triggerWeiboAiResponse(postId)}}}});async function handleDeletePost(postId){if(!postId)return;const postToDelete=weiboData.posts.find(p=>p.postId===postId);if(!postToDelete)return;blmxManager.logEntries=blmxManager.logEntries.filter(entry=>{if(entry.key==='WEIBO_POST'&&entry.data.postId===postId)return!1;if((entry.key==='WEIBO_COMMENT'||entry.key==='WEIBO_LIKE')&&(entry.data.postId===postId||entry.data.target_post_id===postId))return!1;return!0});updateWeiboDataFromLog();await blmxManager.persistLogToStorage();renderWeiboFeed(postToDelete.category);await showDialog({mode:'alert',text:'帖子已删除。'})}
function markWeiboCommentsAsRead(postId){let commentsChanged=!1;blmxManager.logEntries.forEach(entry=>{if(entry.key==='WEIBO_COMMENT'&&entry.data.target_post_id===postId){if(entry.data.isRead===!1){entry.data.isRead=!0;commentsChanged=!0}}});if(commentsChanged){updateWeiboDataFromLog()}
return commentsChanged}
document.getElementById('weibo-anon-toggle-btn').addEventListener('click',async(e)=>{const identity=getAnonymousIdentity();if(!identity||!identity.name){await showDialog({mode:'alert',text:'请先在论坛主页通过齿轮设置您的马甲，才能使用匿名模式。'});e.target.classList.remove('active');isWeiboAnonMode=!1;return}
isWeiboAnonMode=!isWeiboAnonMode;e.target.classList.toggle('active',isWeiboAnonMode);if(isWeiboAnonMode){await showDialog({mode:'alert',text:`匿名模式已开启，将以【${identity.name}】的身份发言。`})}else{await showDialog({mode:'alert',text:'匿名模式已关闭。'})}});document.getElementById('weibo-detail-view').addEventListener('click',async(e)=>{const target=e.target;const detailView=document.getElementById('weibo-detail-view');const postId=detailView.dataset.postId;const userPanel=target.closest('.forum-user-panel');if(userPanel){const postCard=userPanel.closest('.forum-post-card');if(postCard){const authorName=postCard.dataset.authorName;const profileData=findContactByAnyName(authorName);if(profileData&&profileData.id!=='user'&&profileData.id!=='{{user}}'){navigateTo('forumProfile',{contactId:profileData.id})}}
return}
if(target.closest('.share-icon')){handleWeiboForward({currentTarget:detailView});return}
const actionBtn=target.closest('.weibo-comment-actions');if(actionBtn){const action=actionBtn.dataset.action;const commentId=actionBtn.dataset.commentId;if(action==='reply'){const authorName=actionBtn.dataset.authorName;const inputField=detailView.querySelector('.weibo-comment-input');const postCard=actionBtn.closest('.forum-post-card');const commentBody=postCard?postCard.querySelector('.forum-post-body'):null;let replyTextOnly='';if(commentBody){const clone=commentBody.cloneNode(!0);const quoteBlocks=clone.querySelectorAll('.forum-quote-block');quoteBlocks.forEach(el=>el.remove());replyTextOnly=clone.textContent.trim();replyTextOnly=replyTextOnly.replace(/\[引用:"(?:.|\n)*?"\]\s*/g,'')}
if(!replyTextOnly)replyTextOnly='...';const quotePreview=replyTextOnly.substring(0,50);inputField.value=`[引用:"${authorName}: ${quotePreview}"] `;inputField.focus();inputField.setSelectionRange(inputField.value.length,inputField.value.length)}else if(action==='delete'){const confirmed=await showDialog({mode:'confirm',text:'确定要删除这条评论吗？'});if(confirmed){const index=blmxManager.logEntries.findIndex(entry=>entry.key==='WEIBO_COMMENT'&&entry.data.commentId===commentId);if(index>-1){blmxManager.logEntries.splice(index,1);updateWeiboDataFromLog();await blmxManager.persistLogToStorage();const elementToRemove=detailView.querySelector(`[data-comment-id="${commentId}"]`);if(elementToRemove)elementToRemove.remove();const cardToRemove=elementToRemove?elementToRemove.closest('.forum-post-card'):null;if(cardToRemove)cardToRemove.remove();await showDialog({mode:'alert',text:'评论已删除。'})}}}
return}
const sendButton=target.closest('.weibo-send-comment-btn');if(sendButton){try{const inputField=detailView.querySelector('.weibo-comment-input');const rawCommentText=inputField.value.trim();if(!rawCommentText)return;const changed=markWeiboCommentsAsRead(postId);if(changed){await blmxManager.persistLogToStorage();const indicatorsToRemove=detailView.querySelectorAll('.unread-indicator');indicatorsToRemove.forEach(indicator=>indicator.remove())}
let authorId=userProfile.id;if(isWeiboAnonMode){const identity=getAnonymousIdentity();if(identity&&identity.name){authorId=identity.name}else{await showDialog({mode:'alert',text:'错误：匿名模式已开启，但未找到马甲信息。'});return}}
const now=new Date(window.currentGameDate);const localTimestamp=`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;const quoteRegex=/\[引用:"(.*?):\s*([\s\S]*?)"\]([\s\S]*)/;const quoteMatch=rawCommentText.match(quoteRegex);let entryToSave;if(quoteMatch){const quotedAuthorName=quoteMatch[1].trim();const quotedContentRaw=quoteMatch[2].trim();const replyText=quoteMatch[3].trim();const originalComment=(weiboData.comments[postId]||[]).find(c=>{if(getDisplayName(c.author,null)!==quotedAuthorName)return!1;const targetText=(c.text||"").trim();const searchContent=quotedContentRaw;if(!searchContent)return!0;if(searchContent.endsWith('...')){const cleanSearch=searchContent.slice(0,-3).trim();if(cleanSearch.length<2)return targetText.includes(cleanSearch);return targetText.startsWith(cleanSearch)}else{return targetText===searchContent||targetText.includes(searchContent)}});let finalData;if(originalComment){finalData={target_post_id:postId,author:(authorId==='user'?'{{user}}':authorId),text:replyText,replyTo:originalComment.commentId,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,timestamp:localTimestamp,isRead:!1}}else{finalData={target_post_id:postId,author:(authorId==='user'?'{{user}}':authorId),text:rawCommentText,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,timestamp:localTimestamp,isRead:!1}}
entryToSave={key:'WEIBO_COMMENT',data:finalData}}else{const finalData={target_post_id:postId,author:(authorId==='user'?'{{user}}':authorId),text:rawCommentText,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,timestamp:localTimestamp,isRead:!1};entryToSave={key:'WEIBO_COMMENT',data:finalData}}
blmxManager.addEntry(entryToSave);window.currentGameDate=new Date(localTimestamp);console.log(`[BLMX Time Sync] World time advanced: ${window.currentGameDate.toLocaleString()}`);await blmxManager.persistLogToStorage();updateWeiboDataFromLog();appendNewCommentToForum(entryToSave.data);inputField.value='';await triggerWeiboAiResponse(postId)}catch(err){console.error("Weibo send error:",err);await showDialog({mode:'alert',text:'发送失败，请重试。'})}}});document.getElementById('weibo-detail-back-btn').addEventListener('click',()=>{const detailView=document.getElementById('weibo-detail-view');const postId=detailView.dataset.postId;if(postId){const changed=markWeiboCommentsAsRead(postId);if(changed){blmxManager.persistLogToStorage()}}
const post=weiboData.posts.find(p=>p.postId===postId);if(post&&post.category){const zoneCard=document.querySelector(`.weibo-zone-card[data-category="${post.category}"]`);const categoryName=zoneCard?zoneCard.querySelector('.zone-title').textContent:'帖子列表';navigateTo('weiboFeed',{category:post.category,categoryName:categoryName});renderWeiboFeed(post.category)}else{navigateTo('weibo')}});document.getElementById('chat-back-btn').addEventListener('click',()=>{navigateTo(chatReturnPath);if(chatReturnPath==='contacts'){renderContactsList()}});document.getElementById('settings-back-btn').addEventListener('click',()=>navigateTo('home'));document.getElementById('group-settings-back-btn').addEventListener('click',()=>navigateTo('wechatChat',{conversationId:document.getElementById('group-settings-view').dataset.conversationId}));document.getElementById('contact-details-back-btn').addEventListener('click',()=>{if(currentConversationId){navigateTo('wechatChat',{conversationId:currentConversationId})}else{navigateTo('wechatList')}});document.getElementById('set-char-appearance-btn').addEventListener('click',async()=>{const contactId=document.getElementById('contact-details-profile-card').dataset.contactId;const contact=contacts.find(c=>c.id===contactId);if(!contact)return;const currentAppearance=contact.nai_appearance||'';const newAppearance=await showDialog({mode:'prompt',text:`【设置 ${getDisplayName(contact.id, null)} 的外貌特征】\n\n请填写固定的外貌Tag (英文最佳，中文会自动翻译)。\nAI生成视频画面时会强制使用这些特征。\n\n示例: 1girl, silver hair, purple eyes, maid outfit`,defaultValue:currentAppearance});if(newAppearance!==null){contact.nai_appearance=newAppearance.trim();saveData();await showDialog({mode:'alert',text:'外貌设定已保存！下次视频通话时生效。'})}});document.getElementById('wechat-list-back-btn').addEventListener('click',()=>navigateTo('home'));document.getElementById('dynamic-island').addEventListener('click',()=>{if(isGenerating)return;triggerAiResponse(!0)});document.getElementById('chat-options-btn').addEventListener('click',()=>{const conversation=conversations.find(c=>c.id===currentConversationId);if(conversation.type==='single'){const otherMemberId=conversation.members.find(m=>m!=='user');navigateTo('contactDetails',{contactId:otherMemberId})}else if(conversation.type==='group'){navigateTo('groupSettings',{conversationId:currentConversationId})}});document.getElementById('me-view-moments-btn').addEventListener('click',()=>{navigateTo('moments')});document.getElementById('me-profile-card').addEventListener('click',()=>updateAvatar('user'));document.getElementById('contact-details-avatar').addEventListener('click',(e)=>{const contactId=e.target.dataset.contactId;if(contactId){navigateTo('moments',{authorId:contactId})}});document.getElementById('moments-back-btn').addEventListener('click',()=>{if(currentMomentsAuthorId){currentMomentsAuthorId=null;renderMomentsFeed(null)}else{navigateTo('wechatList')}});sendBtn.addEventListener('click',()=>{if(isGenerating)return;const text=wechatInput.value.trim();if(text){stageAndDisplayEntry({type:'message',sender:'user',content:text});wechatInput.value='';const currentTimestamp=new Date(window.currentGameDate).toISOString();updateConversationTimestamp(currentConversationId,currentTimestamp);saveData();renderConversationList();updateFooterButtonsState();delete drafts[currentConversationId];return}
if(userMessageQueue.length>0||hasPendingNotifications){triggerAiResponse(!0)}});document.getElementById('hidden-send-trigger').addEventListener('click',()=>{if(isGenerating)return;triggerAiResponse(!0)});wechatInput.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();const text=wechatInput.value.trim();if(text){stageAndDisplayEntry({type:'message',sender:'user',content:text});wechatInput.value='';const currentTimestamp=new Date(window.currentGameDate).toISOString();updateConversationTimestamp(currentConversationId,currentTimestamp);saveData();renderConversationList();updateFooterButtonsState();delete drafts[currentConversationId]}}});wechatInput.addEventListener('input',updateFooterButtonsState);wechatInput.addEventListener('focus',()=>togglePanel(null));addLongPressListener(wechatInput,async()=>{const currentPlaceholder=wechatInput.placeholder;const newPlaceholder=await showDialog({mode:'prompt',text:"请输入新的输入框提示文字:",defaultValue:currentPlaceholder});if(newPlaceholder!==null){localStorage.setItem(`blmx_input_placeholder_${currentCharId}`,newPlaceholder);wechatInput.placeholder=newPlaceholder;await showDialog({mode:'alert',text:'提示文字已更新！'})}},{duration:5000,preventDefault:!1});document.getElementById('smile-btn').addEventListener('click',()=>togglePanel('sticker'));plusBtn.addEventListener('click',()=>togglePanel('plus'));document.getElementById('microphone-btn').addEventListener('click',async()=>{const text=await showDialog({mode:'prompt',text:'请输入语音内容:'});if(text!==null&&text){const durationStr=await showDialog({mode:'prompt',text:'请输入语音秒数 (只输入数字):'});if(durationStr!==null){const duration=parseInt(durationStr,10);if(!isNaN(duration)&&duration>0){stageAndDisplayEntry({type:'voice',sender:'me',content:{text:text,duration:duration}})}else{await showDialog({mode:'alert',text:'请输入有效的秒数。'})}}}});const plusMenuBtn=document.getElementById('wechat-plus-btn');const plusMenu=document.getElementById('plus-menu');plusMenuBtn.addEventListener('click',(e)=>{e.stopPropagation();plusMenu.style.display=plusMenu.style.display==='block'?'none':'block'});document.body.addEventListener('click',(e)=>{if(plusMenu.style.display==='block'&&!plusMenu.contains(e.target)&&e.target!==plusMenuBtn){plusMenu.style.display='none'}});document.getElementById('plus-menu-add-friend').addEventListener('click',async()=>{const result=await showMultiInputDialog({title:'添加朋友',fields:[{id:'name',label:'朋友的真实姓名 (这将作为唯一ID)',type:'text'},{id:'avatarUrl',label:'朋友的头像URL (可选)',type:'text'}]});if(result===null){return}
const{name,avatarUrl}=result;if(name&&name.trim()){const friendId=name.trim();if(contacts.some(c=>c.id===friendId)||friendId==='user'){await showDialog({mode:'alert',text:'该联系人已存在或名字非法！'});return}
const newContact={id:friendId,name:friendId,avatar:avatarUrl||'',signature:'',cover:'',};contacts.push(newContact);const newConversation={id:`convo_single_${friendId}`,type:'single',members:['user',newContact.id],unread:0,pinned:!1,lastActivity:Date.now()};conversations.push(newConversation);saveData();renderConversationList();await showDialog({mode:'alert',text:`"${newContact.name}" 已添加！`})}else{await showDialog({mode:'alert',text:'朋友的姓名不能为空！'})}});document.getElementById('plus-menu-scan').addEventListener('click',async()=>{plusMenu.style.display='none';const confirmed=await showDialog({mode:'confirm',text:'您扫描的是一个虚拟群聊邀请码，是否要创建一个新的虚拟群聊？'});if(confirmed){await handleCreateVirtualGroup()}});document.getElementById('plus-menu-group-chat').addEventListener('click',async()=>{if(contacts.length<1){await showDialog({mode:'alert',text:'请至少添加一个朋友才能发起群聊！'});return}
const modal=document.getElementById('group-chat-modal');const listContainer=document.getElementById('group-chat-contact-list-container');listContainer.innerHTML='';document.getElementById('group-chat-modal-title').textContent="选择联系人";document.getElementById('group-chat-modal-footer').style.display='block';document.getElementById('group-chat-confirm-btn').style.display='none';contacts.forEach(contact=>{const item=document.createElement('div');item.className='group-chat-contact-item';item.innerHTML=`
                    <input type="checkbox" id="gc-contact-${contact.id}" data-contact-id="${contact.id}">
                    <img src="${getAvatar(contact.id)}" alt="${getDisplayName(contact.id, null)}">
                    <label for="gc-contact-${contact.id}">${getDisplayName(contact.id, null)}</label>
                `;listContainer.appendChild(item)});modal.dataset.mode="create";modal.style.display='flex'});document.getElementById('group-chat-cancel-btn').addEventListener('click',()=>{document.getElementById('group-chat-modal').style.display='none'});document.getElementById('group-chat-create-btn').addEventListener('click',async()=>{const selectedContactIds=[];document.querySelectorAll('#group-chat-contact-list-container input:checked').forEach(checkbox=>{selectedContactIds.push(checkbox.dataset.contactId)});const groupNameInput=document.getElementById('group-chat-name-input');const groupName=groupNameInput.value.trim();if(selectedContactIds.length<1){await showDialog({mode:'alert',text:'请至少选择一个联系人来创建群聊。'});return}
if(!groupName){await showDialog({mode:'alert',text:'请为群聊起一个名字。'});return}
const userJoins=await showDialog({mode:'confirm',text:'您是否要加入这个群聊？\n(确定 = 正常加入)\n(取消 = 上帝视角观察)'});if(userJoins){createGroup(groupName,selectedContactIds,'user',!1)}else{showOwnerSelectionModal(groupName,selectedContactIds)}});function showOwnerSelectionModal(groupName,memberIds){document.getElementById('group-chat-modal').style.display='none';const ownerModal=document.getElementById('group-owner-modal');const ownerList=document.getElementById('group-owner-list-container');ownerList.innerHTML='';memberIds.forEach((id,index)=>{const item=document.createElement('div');item.className='group-owner-item';item.innerHTML=`
                         <input type="radio" name="group-owner" id="owner-${id}" value="${id}" ${index === 0 ? 'checked' : ''}>
                         <img src="${getAvatar(id)}" alt="${getDisplayName(id, null)}">
                         <label for="owner-${id}">${getDisplayName(id, null)}</label>
                    `;ownerList.appendChild(item)});ownerModal.style.display='flex';document.getElementById('group-owner-confirm-btn').onclick=async()=>{const selectedOwner=ownerList.querySelector('input[name="group-owner"]:checked');if(selectedOwner){createGroup(groupName,memberIds,selectedOwner.value,!0);ownerModal.style.display='none'}else{await showDialog({mode:'alert',text:'请选择一位群主！'})}}}
function createGroup(name,members,ownerId,isObserver){const finalMembers=isObserver?[...members]:['user',...members];if(!finalMembers.includes(ownerId)){finalMembers.push(ownerId)}
const uniqueMembers=[...new Set(finalMembers)];const newGroupId=generateDescriptiveGroupId(uniqueMembers);const newConversation={id:newGroupId,type:'group',name:name,members:uniqueMembers,owner:ownerId,admins:[],avatar:'',unread:0,pinned:!1,lastActivity:new Date(window.currentGameDate).getTime(),userIsObserver:isObserver,dissolved:!1,nicknames:{}};const eventData={type:'create',convoId:newGroupId,author:ownerId,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ')};blmxManager.addEntry({type:'group_event',content:eventData});conversations.push(newConversation);saveData();blmxManager.persistLogToStorage().then(()=>{renderConversationList();document.getElementById('group-chat-name-input').value='';document.getElementById('group-chat-modal').style.display='none';navigateTo('wechatChat',{conversationId:newConversation.id})})}
async function handleCreateVirtualGroup(){const groupInfo=await showMultiInputDialog({title:'创建虚拟群聊',fields:[{id:'name',label:'群聊名称',type:'text',defaultValue:''},{id:'desc',label:'背景成员描述 (给AI看)',type:'textarea',defaultValue:'一群符合当前情景的、性格各异的路人。'}]});if(groupInfo===null||!groupInfo.name.trim()){await showDialog({mode:'alert',text:'创建已取消或群聊名称为空。'});return}
const coreMemberIds=await showCoreMemberSelectionModal(groupInfo.name);if(coreMemberIds===null){await showDialog({mode:'alert',text:'创建已取消。'});return}
const finalMembers=['user',...coreMemberIds];const uniqueMembers=[...new Set(finalMembers)];const newGroupId=`convo_vgroup_${Date.now()}`;const newConversation={id:newGroupId,type:'vgroup',name:groupInfo.name.trim(),members:uniqueMembers,background_members_desc:groupInfo.desc.trim(),owner:'user',unread:0,pinned:!1,lastActivity:new Date(window.currentGameDate).getTime(),};conversations.push(newConversation);saveData();renderConversationList();await showDialog({mode:'alert',text:`虚拟群聊 "${newConversation.name}" 创建成功！`});navigateTo('wechatChat',{conversationId:newConversation.id})}
function showCoreMemberSelectionModal(groupName){return new Promise(resolve=>{const modal=document.getElementById('group-chat-modal');const listContainer=document.getElementById('group-chat-contact-list-container');const confirmBtn=document.getElementById('group-chat-confirm-btn');const cancelBtn=document.getElementById('group-chat-cancel-btn');listContainer.innerHTML='';document.getElementById('group-chat-modal-footer').style.display='none';confirmBtn.style.display='block';confirmBtn.textContent='完成';document.getElementById('group-chat-modal-title').textContent=`邀请核心成员 (可选)`;contacts.forEach(contact=>{const item=document.createElement('div');item.className='group-chat-contact-item';item.innerHTML=`
							<input type="checkbox" id="vg-contact-${contact.id}" data-contact-id="${contact.id}">
							<img src="${getAvatar(contact.id)}" alt="${getDisplayName(contact.id, null)}">
							<label for="vg-contact-${contact.id}">${getDisplayName(contact.id, null)}</label>
						`;listContainer.appendChild(item)});const cleanupAndResolve=(value)=>{modal.style.display='none';newConfirmBtn.onclick=null;newCancelBtn.onclick=null;resolve(value)};const newConfirmBtn=confirmBtn.cloneNode(!0);confirmBtn.parentNode.replaceChild(newConfirmBtn,confirmBtn);const newCancelBtn=cancelBtn.cloneNode(!0);cancelBtn.parentNode.replaceChild(newCancelBtn,cancelBtn);newCancelBtn.onclick=()=>cleanupAndResolve(null);newConfirmBtn.onclick=()=>{const selectedIds=[];listContainer.querySelectorAll('input:checked').forEach(cb=>{selectedIds.push(cb.dataset.contactId)});cleanupAndResolve(selectedIds)};modal.style.display='flex'})}
document.getElementById('post-moment-btn').addEventListener('click',async()=>{const result=await showMultiInputDialog({title:'发布新动态',fields:[{id:'text',label:'这一刻的想法...',type:'textarea'},{id:'image_url',label:'图片链接 (可选)',type:'text'},{id:'image_desc',label:'或 图片描述 (可选)',type:'text'},{id:'timestamp',label:'发布时间',type:'text',defaultValue:new Date(window.currentGameDate).toISOString().slice(0,16).replace('T',' ')}]});if(result===null){return}
const{text,image_url,image_desc,timestamp}=result;let image="",image_type="none";if(image_url.trim()){image_type='url';image=image_url.trim()}else if(image_desc.trim()){image_type='desc';image=image_desc.trim()}
if(!text.trim()&&!image.trim()){await showDialog({mode:'alert',text:'不能发布空的朋友圈内容。'});return}
if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(timestamp.trim())){await showDialog({mode:'alert',text:'时间格式不正确，应为 YYYY-MM-DD HH:mm'});return}
const isPrivate=await showDialog({mode:'confirm',text:'是否发布为私密朋友圈？'});let visibleTo=[],invisibleTo=[];if(!isPrivate&&await showDialog({mode:'confirm',text:'是否要设置部分可见/不可见？'})){const mode=await showDialog({mode:'confirm',text:'设置为“部分可见”吗？\n(确定 = 部分可见, 取消 = 不给谁看)'});const ids_str=await showDialog({mode:'prompt',text:'请输入联系人ID，用英文逗号分隔:'});if(ids_str){const ids=ids_str.split(',').map(s=>s.trim()).filter(Boolean);if(mode){visibleTo=ids}else{invisibleTo=ids}}}
const momentData={author:'user',text,image,image_type,timestamp:timestamp.trim(),isPrivate,visibleTo,invisibleTo,momentId:`moment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`};blmxManager.addEntry({key:'MOMENT',data:momentData});if(momentData.image_type==='desc'&&momentData.image){processEntryWithNAI(momentData.momentId,momentData.image,'moment')}
blmxManager.persistLogToStorage();renderMomentsFeed(currentMomentsAuthorId)});momentsFeedList.addEventListener('click',async(e)=>{const postEl=e.target.closest('.moment-post');if(!postEl)return;const momentId=postEl.dataset.momentId;const postAuthorId=postEl.dataset.authorId;if(e.target.classList.contains('post-author-avatar')){if(postAuthorId){navigateTo('moments',{authorId:postAuthorId})}
return}
const momentEntry=blmxManager.logEntries.find(entry=>entry.key==='MOMENT'&&entry.data.momentId===momentId);if(!momentEntry){console.error("Error: Could not find moment entry in log for ID:",momentId);return}
const clickedAction=e.target.closest('[data-action]');if(clickedAction){const action=clickedAction.dataset.action;switch(action){case 'forward':{const momentIdForForward=momentEntry.data.momentId;showForwardTargetModal([momentIdForForward],'forward');break}
case 'like':{const isAlreadyLiked=blmxManager.logEntries.some(entry=>entry.key==='CHAR_LIKE'&&entry.data.target_post_id===momentId&&(entry.data.author==='user'||entry.data.author==='{{user}}'));if(isAlreadyLiked){console.log(`[BLMX Moments] Post ${momentId} is already liked by user. No action taken.`);return}
const data={author:'user',target_post_id:momentId};blmxManager.addEntry({key:'CHAR_LIKE',data});hasPendingNotifications=!0;await blmxManager.persistLogToStorage();renderMomentsFeed(currentMomentsAuthorId);updateFooterButtonsState();await triggerAiMomentsResponse(momentId,null);break}
case 'reply':{const commentText=await showDialog({mode:'prompt',text:"请输入评论内容:"});if(commentText!==null&&commentText.trim()){const data={author:'user',text:commentText.trim(),target_post_id:momentId};blmxManager.addEntry({key:'CHAR_COMMENT',data});await blmxManager.persistLogToStorage();renderMomentsFeed(currentMomentsAuthorId);hasPendingNotifications=!0;updateFooterButtonsState();await triggerAiMomentsResponse(momentId,commentText.trim())}
break}}
return}
if(e.target.closest('.private-icon')&&postAuthorId==='user'){if(await showDialog({mode:'confirm',text:'要将这条私密动态公开吗？'})){momentEntry.data.isPrivate=!1;await blmxManager.persistLogToStorage();renderMomentsFeed(currentMomentsAuthorId)}}else if(e.target.closest('.visibility-icon')){const{visibleTo,invisibleTo}=momentEntry.data;let alertMsg='可见性设置：\n';if(visibleTo&&visibleTo.length>0)alertMsg+=`部分可见: ${visibleTo.map(id => getDisplayName(id, null)).join(', ')}\n`;if(invisibleTo&&invisibleTo.length>0)alertMsg+=`不给谁看: ${invisibleTo.map(id => getDisplayName(id, null)).join(', ')}\n`;await showDialog({mode:'alert',text:alertMsg})}else if(e.target.closest('.delete-moment-btn')){await handleDeleteMoment(momentId)}});wechatBody.addEventListener('click',(e)=>{if(e.target.matches('.message-avatar')){const senderId=e.target.dataset.senderId;if(!senderId)return;const convo=conversations.find(c=>c.id===currentConversationId);if(convo&&convo.type==='single'&&senderId!=='user'){updateAvatar(senderId)}else if(convo&&convo.type==='group'&&senderId!=='user'&&!convo.userIsObserver){const atText=`@${getDisplayName(senderId, convo.id)} `;wechatInput.value+=atText;wechatInput.focus()}}});document.getElementById('delete-contact-btn').addEventListener('click',async(e)=>{const profileCard=e.target.closest('#contact-details-view').querySelector('#contact-details-profile-card');const contactId=profileCard.dataset.contactId;const contact=contacts.find(c=>c.id===contactId);if(!contact)return;const confirmed=await showDialog({mode:'confirm',text:`确定要删除联系人 "${getDisplayName(contact.id, null)}" 吗？\n\n此操作将清除与该联系人的所有聊天记录，并将其从所有群聊中移除，且不可恢复。`});if(confirmed){contacts=contacts.filter(c=>c.id!==contactId);const convosToDelete=conversations.filter(convo=>convo.type==='single'&&convo.members.includes(contactId));const convoIdsToDelete=convosToDelete.map(c=>c.id);conversations=conversations.filter(convo=>!convoIdsToDelete.includes(convo.id));blmxManager.logEntries=blmxManager.logEntries.filter(entry=>{const entryConvoId=entry.conversationId||entry.convoId||(entry.content&&entry.content.convoId)||(entry.data&&entry.data.convoId);return!convoIdsToDelete.includes(entryConvoId)});conversations.forEach(convo=>{if(convo.type==='group'&&convo.members.includes(contactId)){convo.members=convo.members.filter(id=>id!==contactId)}});saveData();await blmxManager.persistLogToStorage();await showDialog({mode:'alert',text:`联系人 "${getDisplayName(contact.id, null)}" 已被彻底删除。`});navigateTo('contacts');renderContactsList()}});document.getElementById('contact-name-header').addEventListener('click',async(e)=>{const convo=conversations.find(c=>c.id===currentConversationId);if(!convo||convo.type!=='single')return;const otherMemberId=convo.members.find(m=>m!=='user');const contact=contacts.find(c=>c.id===otherMemberId);if(!contact)return;const currentRemark=contact.remark||'';const newRemark=await showDialog({mode:'prompt',text:`为 "${contact.name}" 设置备注:`,defaultValue:currentRemark});if(newRemark!==null){contact.remark=newRemark.trim();saveData();e.target.textContent=getDisplayName(otherMemberId,convo.id);renderConversationList()}});document.getElementById('moments-user-name').addEventListener('click',async()=>{const currentName=document.getElementById('moments-user-name').textContent;const targetId=document.getElementById('moments-user-avatar').src===getAvatar('user')?'user':contacts.find(c=>getDisplayName(c.id,null)===currentName)?.id;if(targetId==='user'){const newName=await showDialog({mode:'prompt',text:'请输入你的新名字:',defaultValue:userProfile.name});if(newName&&newName.trim()&&newName!==userProfile.name){userProfile.name=newName.trim();saveData();renderMomentsFeed('user');await showDialog({mode:'alert',text:'名字已更新！'})}}else{const contact=contacts.find(c=>c.id===targetId);if(contact){await showDialog({mode:'alert',text:`你不能修改 ${contact.name} 的名字。`})}}});document.getElementById('moments-user-avatar').addEventListener('click',async()=>{const currentName=document.getElementById('moments-user-name').textContent;const targetId=document.getElementById('moments-user-avatar').src===getAvatar('user')?'user':contacts.find(c=>getDisplayName(c.id,null)===currentName)?.id;const targetObject=targetId==='user'?userProfile:contacts.find(c=>c.id===targetId);if(targetObject){const currentSignature=targetObject.signature||'';const newSignature=await showDialog({mode:'prompt',text:'请输入个性签名:',defaultValue:currentSignature});if(newSignature!==null){targetObject.signature=newSignature;saveData();renderMomentsFeed(targetObject.id)}}});document.getElementById('delete-mode-trigger').addEventListener('click',async()=>{const wechatView=document.getElementById('wechat-chat-view');wechatView.classList.toggle('delete-mode');if(wechatView.classList.contains('delete-mode')){await showDialog({mode:'alert',text:'已进入删除模式。点击任意消息或时间戳可将其删除。再次点击左上角可退出。'})}else{await showDialog({mode:'alert',text:'已退出删除模式。'})}});wechatBody.addEventListener('click',async(e)=>{const wechatView=document.getElementById('wechat-chat-view');if(!wechatView.classList.contains('delete-mode')){return}
const targetRow=e.target.closest('[data-log-index]');if(targetRow){e.preventDefault();e.stopPropagation();const indexToDelete=parseInt(targetRow.dataset.logIndex,10);let previewText=targetRow.textContent.trim().replace(/\s+/g,' ').substring(0,50);const confirmed=await showDialog({mode:'confirm',text:`确定要删除这条记录吗？\n\n预览: "${previewText}..."`});if(confirmed){blmxManager.logEntries.splice(indexToDelete,1);blmxManager.persistLogToStorage();renderChatHistory(currentConversationId);renderMomentsFeed(currentMomentsAuthorId)}}},!0);document.getElementById('image-upload-input').addEventListener('change',e=>{const file=e.target.files[0];if(file){const reader=new FileReader();reader.onload=async readerEvent=>{const imageUrl=readerEvent.target.result;try{stageAndDisplayEntry({type:'image',sender:'me',content:{type:'url',value:imageUrl}});togglePanel(null)}catch(err){await showDialog({mode:'alert',text:'图片太大无法发送，请选择一张小一点的图片。'});console.error("Error with image:",err)}};reader.readAsDataURL(file)}
e.target.value=null});document.getElementById('group-settings-avatar-btn').addEventListener('click',async()=>{const convoId=document.getElementById('group-settings-view').dataset.conversationId;const convo=conversations.find(c=>c.id===convoId);if(!convo)return;const newAvatar=await showDialog({mode:'prompt',text:'请输入新的群聊头像URL:',defaultValue:convo.avatar||''});if(newAvatar!==null){convo.avatar=newAvatar;saveData();renderConversationList();await showDialog({mode:'alert',text:'群头像已更新。'})}});document.getElementById('group-settings-name-item').addEventListener('click',async()=>{const convoId=document.getElementById('group-settings-view').dataset.conversationId;const convo=conversations.find(c=>c.id===convoId);if(!convo||convo.userIsObserver)return;const newName=await showDialog({mode:'prompt',text:'请输入新的群聊名称:',defaultValue:convo.name});if(newName&&newName.trim()){const eventData={type:'rename',convoId:convo.id,author:userProfile.id,newName:newName.trim(),timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ')};blmxManager.addEntry({type:'group_event',content:eventData});addGroupEventToWeChat(eventData);convo.name=newName.trim();convo.lastActivity=Date.now();blmxManager.persistLogToStorage();saveData();document.getElementById('group-settings-name').textContent=convo.name;document.getElementById('contact-name-header').textContent=`${convo.name} (${convo.members.length})`}});document.getElementById('group-settings-member-grid').addEventListener('click',async(e)=>{const memberItem=e.target.closest('.group-member-item');const addBtn=e.target.closest('.add-member-btn');const convoId=document.getElementById('group-settings-view').dataset.conversationId;const convo=conversations.find(c=>c.id===convoId);if(!convo)return;if(addBtn){if(convo.userIsObserver){await showDialog({mode:'alert',text:'你不能向这个群里添加成员。'});return}
showForwardTargetModal([],'addMember');return}
if(memberItem){if(convo.userIsObserver||memberItem.dataset.memberId==='user'){return}
const memberId=memberItem.dataset.memberId;showGroupMemberContextMenu(memberId,convoId,e)}});document.getElementById('group-chat-confirm-btn').addEventListener('click',async()=>{const modal=document.getElementById('group-chat-modal');const mode=modal.dataset.mode;if(mode==='forward'){const selectedTarget=modal.querySelector('input[name="forward-target"]:checked');if(selectedTarget){const targetConvoId=selectedTarget.value;const selectedMessageIds=JSON.parse(modal.dataset.messageIds);let fwdTitle='聊天记录';if(selectedMessageIds.length>0&&selectedMessageIds[0].startsWith('moment_')){const momentIndex=parseInt(selectedMessageIds[0].replace('moment_',''),10);const moment=blmxManager.logEntries[momentIndex];fwdTitle=`转发的动态`}else{const currentConvo=conversations.find(c=>c.id===currentConversationId);const otherMemberName=currentConvo.type==='single'?getDisplayName(currentConvo.members.find(m=>m!=='user'),currentConvo.id):currentConvo.name;fwdTitle=`“${getDisplayName('user', null)}”和“${otherMemberName}”的聊天记录`}
const forwardData={title:fwdTitle,messageIds:selectedMessageIds,};exitForwardMode();navigateTo('wechatChat',{conversationId:targetConvoId});stageAndDisplayEntry({type:'forward',sender:'me',data:forwardData});modal.style.display='none'}else{await showDialog({mode:'alert',text:'请选择一个转发目标。'})}}else if(mode==='shareMusic'){const selectedTarget=modal.querySelector('input[name="forward-target"]:checked');if(selectedTarget){const targetConvoId=selectedTarget.value;const musicData=JSON.parse(modal.dataset.messageIds);const entry={type:'music_share',sender:'me',conversationId:targetConvoId,data:musicData,timestamp:new Date(window.currentGameDate).toISOString()};blmxManager.addEntry(entry);updateConversationTimestamp(targetConvoId,entry.timestamp);await blmxManager.persistLogToStorage();saveData();modal.style.display='none';navigateTo('wechatChat',{conversationId:targetConvoId});if(currentConversationId===targetConvoId){renderChatHistory(targetConvoId)}}else{await showDialog({mode:'alert',text:'请选择一个分享目标。'})}}else if(modal.dataset.mode==='addMember'){const convoId=modal.dataset.convoId;const convo=conversations.find(c=>c.id===convoId);if(!convo)return;const selectedContactIds=[];document.querySelectorAll('#group-chat-contact-list-container input:checked').forEach(checkbox=>{selectedContactIds.push(checkbox.dataset.contactId)});if(selectedContactIds.length===0){await showDialog({mode:'alert',text:'请至少选择一个要添加的成员。'});return}
convo.members.push(...selectedContactIds);convo.lastActivity=Date.now();const eventData={type:'add',convoId:convoId,author:userProfile.id,targetIds:selectedContactIds,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ')};blmxManager.addEntry({type:'group_event',content:eventData});renderChatHistory(convoId);blmxManager.persistLogToStorage();saveData();modal.style.display='none';navigateTo('groupSettings',{conversationId:convoId})}else if(modal.dataset.mode==='selectRecipient'){const selectedTarget=modal.querySelector('input[name="recipient-target"]:checked');if(selectedTarget){const recipientId=selectedTarget.value;const itemType=modal.dataset.itemType;let itemData=JSON.parse(modal.dataset.itemData);itemData.recipientId=recipientId;stageAndDisplayEntry({type:itemType,sender:'me',data:itemData});modal.style.display='none';togglePanel(null)}else{await showDialog({mode:'alert',text:'请选择一个接收者。'})}}});document.getElementById('group-dissolve-btn').addEventListener('click',async(e)=>{const convoId=document.getElementById('group-settings-view').dataset.conversationId;const convo=conversations.find(c=>c.id===convoId);if(!convo)return;const action=e.currentTarget.dataset.action;if(action==="dissolve"){if(convo.owner!=='user'){await showDialog({mode:'alert',text:'你不是群主，无法解散该群。'});return}
const keepHistory=await showDialog({mode:'confirm',text:'是否保留此群聊的聊天记录？\n(确定 = 存档群聊，可恢复)\n(取消 = 彻底删除)'});if(keepHistory){convo.dissolved=!0;convo.archived=!0}else{const convoIndex=conversations.findIndex(c=>c.id===convoId);if(convoIndex>-1)conversations.splice(convoIndex,1);blmxManager.logEntries=blmxManager.logEntries.filter(entry=>(entry.conversationId||entry.convoId)!==convoId)}
const eventData={type:'dissolve',convoId:convoId,author:userProfile.id,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ')};blmxManager.addEntry({type:'group_event',content:eventData});blmxManager.persistLogToStorage();saveData();navigateTo('wechatList')}else if(action==='recover'){convo.dissolved=!1;convo.archived=!1;await showDialog({mode:'alert',text:'群聊已恢复！'});saveData();navigateTo('groupSettings',{conversationId:convo.id})}else if(action==="delete"){const keepHistory=await showDialog({mode:'confirm',text:'是否保留此群聊的聊天记录？\n(确定 = 仅删除聊天入口)\n(取消 = 彻底删除聊天和记录)'});const convoIndex=conversations.findIndex(c=>c.id===convoId);if(convoIndex>-1)conversations.splice(convoIndex,1);if(!keepHistory){blmxManager.logEntries=blmxManager.logEntries.filter(entry=>(entry.conversationId||entry.convoId)!==convoId);blmxManager.persistLogToStorage()}
saveData();navigateTo('wechatList')}});document.getElementById('observer-poke-btn').addEventListener('click',()=>{triggerAiResponse(!0,!0)});document.getElementById('observer-screenshot-btn').addEventListener('click',()=>{takeLongScreenshot()});document.getElementById('set-private-chat-wallpaper-btn').addEventListener('click',createWallpaperChangeHandler(null,!0));document.getElementById('group-settings-wallpaper-btn').addEventListener('click',createWallpaperChangeHandler(WALLPAPER_KEYS.chat,!1));document.getElementById('show-last-ai-response-btn').addEventListener('click',(e)=>{e.preventDefault();showDebugWindow('AI最新原始回复',latestAiRawResponse,'#72adf3')});document.getElementById('show-last-prompt-btn').addEventListener('click',(e)=>{e.preventDefault();showDebugWindow('发送给AI的最新提示',latestPromptSentToAI,'#81c784')});document.getElementById('forward-cancel-btn').addEventListener('click',exitForwardMode);document.getElementById('forward-confirm-btn').addEventListener('click',handleForwardConfirm);document.querySelector('#forward-content-modal .close-btn').addEventListener('click',()=>{document.getElementById('forward-content-modal').style.display='none'});const settingsView=document.getElementById('settings-view');if(settingsView){settingsView.addEventListener('click',function(e){if(e.target.matches('.tutorial-container .toc a')){e.preventDefault();const href=e.target.getAttribute('href');const targetId=href.substring(1);const scrollContainer=document.querySelector('#settings-view .settings-body');const targetElement=document.getElementById(targetId);if(targetElement&&scrollContainer){const targetPosition=targetElement.offsetTop;scrollContainer.scrollTo({top:targetPosition-scrollContainer.offsetTop-15,behavior:'smooth'})}}})}}
async function parseAndHandleAiResponse(rawResponse,context={}){const currentBatchMoments=[];const{contextCategory=null,contextPostId=null}=context;let fullResponse=rawResponse.trim();if(!fullResponse)return;const commandKeywords=['EVENT_LOG','GROUP_EVENT','SIGNATURE_UPDATE','RECALL_MESSAGE','MOMENT','CHAR_COMMENT','CHAR_LIKE','CREATE_GROUP','KICK_MEMBER','LEAVE_GROUP','MUTE_MEMBER','SET_ADMIN','CHANGE_NICKNAME','RENAME_GROUP','WEIBO_POST','WEIBO_COMMENT','WEIBO_LIKE','DELETE_WEIBO_POST','DIARY_ENTRY','FORUM_THREAD','WEIBO_POST_CONTENT','WEIBO_INITIAL_COMMENT','VIDEO_CALL','END_CALL','UPDATE_CALL_SCREEN','INVITE_MEMBER','MUSIC_SHARE','FOOTPRINTS','GALLERY_UPDATE','HIDDEN_ALBUM_UPDATE','TRASH_BIN_UPDATE','SHOPPING_UPDATE','TAOBAO_HOME'];const commandRegex=new RegExp(`(${commandKeywords.join('|')}):`,'g');const parts=fullResponse.split(commandRegex);const now=new Date(window.currentGameDate);const baseTimestampStr=`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;const realisticTimestamps=generateRealisticTimestamps(baseTimestampStr,Math.max(1,parts.length/2));let timestampCounter=0;let lastProcessedMomentId=null;const processCommandData=(key,jsonString)=>{try{jsonString=jsonString.trim();if(jsonString.endsWith(']')){jsonString=jsonString.slice(0,-1)}
jsonString=jsonString.replace(/\n/g,'\\n');const data=JSON.parse(jsonString);const detailView=document.getElementById('weibo-detail-view');if(key==='WEIBO_POST_CONTENT'||key==='WEIBO_COMMENT'||key==='WEIBO_INITIAL_COMMENT'){if(contextPostId){if(key==='WEIBO_POST_CONTENT')data.postId=contextPostId;if(key==='WEIBO_COMMENT'||key==='WEIBO_INITIAL_COMMENT')data.target_post_id=contextPostId}}
if(key==='WEIBO_POST'&&!data.postId){data.postId=`weibo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
if(key==='MOMENT'&&!data.momentId){data.momentId=`moment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
currentBatchMoments.push(data);if(realisticTimestamps[timestampCounter]){if(['WEIBO_COMMENT','WEIBO_INITIAL_COMMENT','FORUM_THREAD'].includes(key)){data.timestamp=realisticTimestamps[timestampCounter];timestampCounter++}}
if(key==='CHAR_COMMENT'&&data.text){const quoteRegex=/^\[引用:"(.*?):\s*(.*?)"\]\s*(.*)$/s;const match=data.text.match(quoteRegex);if(match){const targetAuthor=match[1].trim();const targetContent=match[2].trim();const cleanReply=match[3].trim();const findMatch=(momentData)=>{if(momentData.author!==targetAuthor)return!1;const textMatch=momentData.text&&momentData.text.includes(targetContent);const imageMatch=momentData.image&&momentData.image.includes(targetContent);return textMatch||imageMatch};let targetMoment=[...currentBatchMoments].reverse().find(findMatch);if(!targetMoment){const allHistoryMoments=blmxManager.logEntries.filter(e=>e.key==='MOMENT').map(e=>e.data);targetMoment=[...allHistoryMoments].reverse().find(findMatch)}
if(targetMoment){data.target_post_id=targetMoment.momentId;data.text=cleanReply;console.log(`[Moments Match] 成功通过引用定位到朋友圈 ID: ${targetMoment.momentId}`)}else{console.warn(`[Moments Match] 未找到匹配的朋友圈: ${targetAuthor} - ${targetContent}`)}}}
if(key==='WEIBO_COMMENT'||key==='WEIBO_INITIAL_COMMENT'){const postId=data.target_post_id;const rawCommentText=data.text;const quoteRegex=/\[引用:"(.*?):\s*([\s\S]*?)"\]([\s\S]*)/;const quoteMatch=rawCommentText.match(quoteRegex);let finalData;if(quoteMatch){const quotedAuthorName=quoteMatch[1].trim();const quotedContent=quoteMatch[2].trim();const replyText=quoteMatch[3].trim();const originalComment=(weiboData.comments[postId]||[]).find(c=>getDisplayName(c.author,null)===quotedAuthorName&&c.text.trim()===quotedContent);if(originalComment){finalData={...data,text:replyText,replyTo:originalComment.commentId,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,isRead:(key==='WEIBO_INITIAL_COMMENT'),}}else{finalData={...data,text:rawCommentText,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,isRead:(key==='WEIBO_INITIAL_COMMENT'),}}}else{finalData={...data,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,isRead:(key==='WEIBO_INITIAL_COMMENT'),}}
if(finalData&&finalData.image_type==='desc'&&finalData.image){processEntryWithNAI(finalData.commentId,finalData.image,'weibo')}else if(!finalData&&data.image_type==='desc'&&data.image){processEntryWithNAI(data.commentId,data.image,'weibo')}
blmxManager.addEntry({key:'WEIBO_COMMENT',data:finalData||data});if(detailView.classList.contains('active')&&detailView.dataset.postId===postId){updateWeiboDataFromLog();appendNewCommentToForum(finalData||data)}
return}
switch(key){case 'WEIBO_POST':if(data.image_type==='desc'&&data.image){processEntryWithNAI(data.postId,data.image,'weibo',data.ai_prompt);delete data.ai_prompt}
handleAiSystemCommand(key,data,contextPostId);break;case 'MUSIC_SHARE':if(data.author){const shareData={title:data.title||'未知歌曲',artist:data.artist||'未知歌手',cover:data.cover||''};const musicShareEntry={type:'music_share',sender:data.author,conversationId:currentConversationId,data:shareData,timestamp:new Date(window.currentGameDate).toISOString()};blmxManager.addEntry(musicShareEntry);updateConversationTimestamp(currentConversationId,musicShareEntry.timestamp);uiNeedsRefresh=!0}
break;case 'FOOTPRINTS':const fpEntry={type:'footprints',author:data.author,content:data,timestamp:new Date(window.currentGameDate).toISOString()};blmxManager.addEntry(fpEntry);if(document.getElementById('cp-footprints-view').classList.contains('active')&&currentCheckPhoneTargetId===data.author){renderFootprintsData(data)}
break;case 'GALLERY_UPDATE':if(!data.author)data.author=currentCheckPhoneTargetId||'unknown';const entryId=`msg-gallery-${Date.now()}`;const newEntry={id:entryId,type:'gallery_update',author:data.author,content:data,timestamp:new Date(window.currentGameDate).toISOString()};blmxManager.addEntry(newEntry);if(data.items&&Array.isArray(data.items)){data.items.forEach((item,index)=>{const uniqueImgId=`${entryId}_img_${index}`;if(item.image){processEntryWithNAI(uniqueImgId,item.image,'gallery',item.ai_prompt)}})}
const galleryView=document.getElementById('cp-gallery-view');if(galleryView&&galleryView.classList.contains('active')){renderGalleryApp(data.author)}
console.log("[Gallery] Parsed, queued NAI, and rendered update for:",data.author);break;case 'HIDDEN_ALBUM_UPDATE':case 'TRASH_BIN_UPDATE':if(!data.author)data.author=currentCheckPhoneTargetId||'unknown';const updateId=`msg-${key.toLowerCase()}-${Date.now()}`;blmxManager.addEntry({id:updateId,type:key.toLowerCase(),author:data.author,content:data,timestamp:new Date(window.currentGameDate).toISOString()});if(data.items&&Array.isArray(data.items)){data.items.forEach((item,index)=>{const uniqueImgId=`${updateId}_img_${index}`;if(item.image){processEntryWithNAI(uniqueImgId,item.image,'gallery',item.ai_prompt)}})}
const hiddenView=document.getElementById('cp-hidden-album-view');const trashView=document.getElementById('cp-trash-bin-view');if(key==='HIDDEN_ALBUM_UPDATE'&&hiddenView.classList.contains('active')){renderHiddenAlbum(data.author)}
if(key==='TRASH_BIN_UPDATE'&&trashView.classList.contains('active')){renderTrashBin(data.author)}
break;case 'SHOPPING_UPDATE':if(!data.author)data.author=currentCheckPhoneTargetId||'unknown';const shopEntryId=`msg-shopping-${Date.now()}`;blmxManager.addEntry({id:shopEntryId,type:'shopping_update',author:data.author,content:data,timestamp:new Date(window.currentGameDate).toISOString()});if(data.items&&Array.isArray(data.items)){data.items.forEach((item,index)=>{const uniqueImgId=`${shopEntryId}_img_${index}`;if(item.image){processEntryWithNAI(uniqueImgId,item.image,'shopping')}})}
const shoppingView=document.getElementById('cp-shopping-view');if(shoppingView&&shoppingView.classList.contains('active')){renderShoppingApp(data.author)}
break;case 'TAOBAO_HOME':if(!data.author)data.author=currentCheckPhoneTargetId||'unknown';const tbEntryId=`msg-tb-home-${Date.now()}`;blmxManager.logEntries=blmxManager.logEntries.filter(e=>!(e.type==='taobao_home'&&e.author===data.author));blmxManager.addEntry({id:tbEntryId,type:'taobao_home',author:data.author,content:data,timestamp:new Date(window.currentGameDate).toISOString()});if(data.items&&Array.isArray(data.items)){data.items.forEach((item,index)=>{const uniqueImgId=`${tbEntryId}_img_${index}`;if(item.image){processEntryWithNAI(uniqueImgId,item.image,'shopping_home')}})}
const tbHomeView=document.getElementById('cp-shopping-home-view');if(tbHomeView&&tbHomeView.classList.contains('active')){renderShoppingHome(data.author)}
break;case 'VIDEO_CALL':if(currentCallState==='idle'){const callEntry={key:'VIDEO_CALL',data:{caller:data.caller,receiver:data.receiver,timestamp:new Date(window.currentGameDate).toISOString(),status:'unanswered'}};blmxManager.addEntry(callEntry);blmxManager.persistLogToStorage();showIncomingCall(data.caller)}
break;case 'END_CALL':if(currentCallState==='in-call'&&data.ender===callPartner.id){showDialog({mode:'alert',text:`${getDisplayName(data.ender, null)} 挂断了通话。`});endCurrentCall()}
break;case 'UPDATE_CALL_SCREEN':handleUpdateCallScreen(data);break;case 'FORUM_THREAD':const newPost={postId:`weibo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,author:data.author,title:data.title,isPinned:data.isPinned||!1,hotness:data.hotness||0,category:contextCategory,timestamp:data.timestamp,};blmxManager.addEntry({key:'WEIBO_POST',data:newPost});break;case 'WEIBO_POST_CONTENT':const pId=data.postId;const postToUpdate=weiboData.posts.find(p=>p.postId===pId);if(data.image_type==='desc'&&data.image){processEntryWithNAI(data.postId,data.image,'weibo',data.ai_prompt);delete data.ai_prompt}
if(postToUpdate){postToUpdate.text=data.content;if(data.image){postToUpdate.image=data.image;postToUpdate.image_type=data.image_type}
const logEntry=blmxManager.logEntries.find(e=>e.key==='WEIBO_POST'&&e.data.postId===pId);if(logEntry){logEntry.data.text=data.content;if(data.image){logEntry.data.image=data.image;logEntry.data.image_type=data.image_type}
delete logEntry.data.content}}
break;default:handleAiSystemCommand(key,data,contextPostId);break;case 'MOMENT':data.momentId=`moment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;if(data.image_type==='desc'&&data.image){processEntryWithNAI(data.momentId,data.image,'moment',data.ai_prompt);delete data.ai_prompt}
blmxManager.addEntry({key,data});if(data.author!=='user'){const momentsConvo=conversations.find(c=>c.id==='moments_feed');if(momentsConvo){momentsConvo.unread=(momentsConvo.unread||0)+1;updateConversationTimestamp('moments_feed',data.timestamp)}}
lastProcessedMomentId=data.momentId;break}
if(key==='MOMENT')lastProcessedMomentId=data.momentId;else lastProcessedMomentId=null}catch(e){console.error(`[BLMX Parser] 解析指令 "${key}" 失败:`,e)}};const lines=fullResponse.split('\n');for(const line of lines){if(!line.trim())continue;const chatMatch=line.match(/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/);const commandMatch=line.match(new RegExp(`^(${commandKeywords.join('|')}):(.*)$`));if(commandMatch){processCommandData(commandMatch[1],commandMatch[2])}else if(chatMatch){const convoId=chatMatch[1];const senderId=chatMatch[2].trim();const rawContent=chatMatch[3].trim();let cleanContent=rawContent;if(cleanContent.startsWith('[')&&cleanContent.endsWith(']')){cleanContent=cleanContent.slice(1,-1).trim()}
const embeddedCommandRegex=new RegExp(`^(${commandKeywords.join('|')}):\\s*(\\{.*\\})$`);const embeddedMatch=cleanContent.match(embeddedCommandRegex);if(embeddedMatch){console.log(`[BLMX Parser] 拦截到聊天内嵌指令: ${embeddedMatch[1]}`);processCommandData(embeddedMatch[1],embeddedMatch[2])}else{handleAiChatMessage(rawContent,senderId,convoId)}}else{const rescueMatch=line.match(new RegExp(`(${commandKeywords.join('|')}):(\\{.*\\})`));if(rescueMatch){console.log(`[BLMX Parser] 触发救急匹配 (格式错乱): ${rescueMatch[1]}`);processCommandData(rescueMatch[1],rescueMatch[2])}}}
if(timestampCounter>0&&realisticTimestamps[timestampCounter-1]){const lastTimestamp=realisticTimestamps[timestampCounter-1];window.currentGameDate=new Date(lastTimestamp.replace(' ','T'))}
await blmxManager.persistLogToStorage();updateWeiboDataFromLog();if(Views.weiboFeed.classList.contains('active')&&contextCategory){renderWeiboFeed(contextCategory)}
if(Views.wechatChat.classList.contains('active'))renderChatHistory(currentConversationId);if(Views.moments.classList.contains('active'))renderMomentsFeed(currentMomentsAuthorId);if(Views.diaryEntry.classList.contains('active')){navigateTo('diaryEntry',{ownerId:document.getElementById('diary-entry-view').dataset.ownerId})}
renderDiaryBookmarks();renderConversationList();updateAppBadge();saveData()}
function getProfilePostCreationContextForAI(characterId){const character=contacts.find(c=>c.id===characterId);if(!character){console.error(`[AI Context] 无法为 ${characterId} 创建发帖上下文，角色不存在。`);return null}
const isNaiEnabled=localStorage.getItem(`blmx_nai_enabled_${currentCharId}`)==='true';const allZones=getWeiboZones();const zonesMenu=allZones.map(zone=>`- 【${zone.title}】(ID: ${zone.id})`).join('\n');const naiRule=isNaiEnabled?`
* **[绘图指令增强 - 必须严格遵守]**:
你必须在 WEIBO_POST 指令中包含 "ai_prompt" 字段。
1. **核心逻辑**: 将你输出的中文描述转化为详细的英文 NAI (NovelAI Diffusion) 格式提示词。
2. **内容要求**: 提示词应包含具体的构图（如 close-up, perspective）、光影氛围（如 soft lighting, cinematic shadows）、情感表情及肢体动作。
3. **私密场景 (NSFW)**: 若当前处于私密或暧昧情节，提示词应优先采用近距离视角，聚焦于身体纠缠、皮肤质感与局部特写。
4. **风格一致性**: 必须符合当前角色的人设、穿着及环境设定。`:"";const finalPrompt=`
[任务：角色自主创作与发布]

* **核心身份**: 你现在是**${getDisplayName(characterId, null)} (ID: ${characterId})**。

* **你的任务**:
基于你完整的人设、记忆和当前心境，构思并撰写 **三篇** 你此刻最想发的帖子。

* **【最高准则】**:
1. **主题自由**: 内容完全由你决定，但必须符合${characterId}人设。
2. **分区选择**: 你必须从下方的“可用分区菜单”中选择最合适的分区。
${zonesMenu}

【视觉描述与绘图要求】${naiRule}

[技术要求：输出格式]
你的回复中 **只能包含** “WEIBO_POST”指令，每一条指令占一行，总共三行。严禁任何额外的解释。

* **指令格式**:
\`WEIBO_POST:{"author":"${characterId}","category":"分区ID","title":"标题可包含类型前缀如 [求助]","text":"正文","timestamp":"YYYY-MM-DDTHH:mm","image":"图片的详细中文画面描述","image_type":"desc"${isNaiEnabled ? ', "ai_prompt":"Detailed English NAI tags"' : ''}}\`

[你的指令]
现在，请以 **${getDisplayName(characterId, null)}** 的身份，开始你的创作。`;return finalPrompt.trim()}
async function handleTriggerProfilePostCreation(characterId){if(isGenerating){await showDialog({mode:'alert',text:'AI正在为其他事情忙碌，请稍后再来催更。'});return}
console.log(`[Profile Posts] Triggering post creation for character: ${characterId}`);isGenerating=!0;updateFooterButtonsState();try{const contextForAI=getProfilePostCreationContextForAI(characterId);if(!contextForAI)throw new Error("无法为AI生成有效的发帖上下文。");latestPromptSentToAI=contextForAI;await showDialog({mode:'alert',text:`正在激发 ${getDisplayName(characterId, null)} 的创作灵感，请稍候...`});const rawResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){await parseAndHandleAiResponse(latestAiRawResponse);await showDialog({mode:'alert',text:`${getDisplayName(characterId, null)} 发布了新的动态！`})}else{await showDialog({mode:'alert',text:'角色似乎没有什么想说的。'})}}catch(error){console.error("[Profile Posts] AI post creation failed:",error);await showDialog({mode:'alert',text:`催更失败: ${error.message}`})}finally{isGenerating=!1;updateFooterButtonsState();const view=document.getElementById('forum-profile-view');const currentProfileId=view.querySelector('.profile-name').textContent;const profileData=findContactByAnyName(currentProfileId);if(profileData&&profileData.id===characterId){await renderForumProfile(characterId);const tabsContainer=view.querySelector('.profile-tabs');const contentContainer=view.querySelector('.profile-tab-content');tabsContainer.querySelectorAll('.tab-item').forEach(tab=>tab.classList.remove('active'));contentContainer.querySelectorAll('.profile-tab-content > div').forEach(content=>content.classList.remove('active'));tabsContainer.querySelector('.tab-item[data-tab="posts"]').classList.add('active');contentContainer.querySelector('#profile-tab-posts').classList.add('active')}}}
function getAmaAnswerContextForAI(contactId,question){const contact=(contactId==='user'||contactId==='{{user}}')?userProfile:contacts.find(c=>c.id===contactId);if(!contact){console.error(`[AMA Context] 无法为 ${contactId} 创建上下文，角色不存在。`);return null}
const finalPrompt=`
[任务: 匿名提问箱]

*   **核心身份**: 你现在是 **${getDisplayName(contact.id, null)} (ID: ${contact.id})**。

*   **当前情景**:
    这是一个私人的匿名提问箱，有人匿名向你提问，极度私密，除了你没人看到。

*   **提问箱**:
    "${question}"

*   **【最高准则：人设一致】**:
    你必须做出符合该角色人设的回答，禁止OOC，内容可长可短，视人设决定。直面这个问题，并给出你内心最原始、最未经修饰的真实想法。

*   **你的任务**:
    作为 **${getDisplayName(contact.id, null)}** ，以他的口吻回答这个问题。

[技术要求：输出格式]
你的回复中 **只能包含** 下方的指令格式，严禁任何额外的解释、闲聊或Markdown标记。

AMA_ANSWER:{"answer":"这里是你的回答..."}

*   **【输出示例】**:
    AMA_ANSWER:{"answer":"你的回复内容"}

[你的指令]
现在，请沉浸到角色的内心深处，严格遵循以上格式，给出你的回答。
`;return finalPrompt.trim()}
function getFullPostPrompt(postId){const post=weiboData.posts.find(p=>p.postId===postId);if(!post){console.error(`[BLMX Forum] 无法为帖子 ${postId} 创建上下文，帖子未找到。`);return null}
const isNaiEnabled=localStorage.getItem(`blmx_nai_enabled_${currentCharId}`)==='true';const categoryName=document.querySelector(`.weibo-zone-card[data-category="${post.category}"] .zone-title`).textContent;const communityBible=getCommunityBibleForCategory(post.category);const naiRule=isNaiEnabled?`
* **[绘图指令增强 - 必须严格遵守]**:
你必须在 WEIBO_POST_CONTENT 指令中包含 "ai_prompt" 字段。
1. **格式要求**: Prompts must follow NovelAI (NAI Diffusion) format.
2. **构图与氛围**: The positive prompt should describe the scene vividly with composition, lighting, and emotion details. 提示词应包含具体的构图（如 close-up, perspective）、光影氛围（如 soft lighting, cinematic shadows）、情感表情及肢体动作。
3. **叙事一致性**: Prompts should reflect the plot, character traits, and style (e.g., anime, CGI, cinematic) to create visually stunning images consistent with the narrative.
4. **私密场景 (NSFW)**: Encourage generating diverse NSFW prompts that align with the character’s settings. NSFW场景下，优先采用近距离，聚焦于身体纠缠的视角，强调皮肤质感与局部特写。
5. **核心逻辑**: 请根据你输出的中文描述，将其深度转化为详细的英文 NAI 格式提示词。`:"";const finalPrompt=`
[任务: 活化这个帖子]

* **【最高优先级：核心禁令】**:
1. **人设严格遵守 (OOC禁令)**: 在扮演任何核心角色 (char) 发表评论前，你 **必须** 深入思考该角色的性格和背景。 **绝对禁止** 做出任何不符合角色人设的行为（OOC）。
2. **用户身份禁令**: 用户的ID是 '{{user}}'。你 **绝对禁止** 以 '{{user}}' 的身份或名义生成任何评论、点赞或任何形式互动。

* **当前情景**: 你正泡在【${categoryName}】论坛里，刚刚刷到了下面这个新帖子。现在，轮到你下场发帖并引导评论。

---
[帖子详情]
* 标题: "${post.title}"
* 作者: "${post.author}"
* 社区氛围参考: ${communityBible}
---

【你的双重任务】
1. **补完正文**: 首先，为这个帖子撰写一篇详细、符合禁令、标题和作者人设的完整正文。正文应简洁明了，抓住核心，模拟真实社交平台。
2. **点燃评论区**: 接着，扮演多个不同身份的论坛用户，对你刚刚写下的正文发表 3-5 条评论。

【视觉描述与绘图要求】${naiRule}

[技术要求：输出格式]
你的回复必须严格遵循下面的指令格式，先输出正文，再输出评论，不要包含任何额外的解释。

* **正文 (必须有1条)**:
* **格式**: \`WEIBO_POST_CONTENT:{"content":"正文内容...使用 \`\\n\` 分段","image":"图片详细中文画面描述","image_type":"desc"${isNaiEnabled ? ', "ai_prompt":"Detailed English NAI tags"' : ''}}\`

* **初始评论 (必须有3-5条)**:
* **格式**: \`WEIBO_INITIAL_COMMENT:{"author":"角色ID或路人名","text":"评论内容"}\`

[你的指令]
现在，请沉浸到这个论坛里，严格遵循以上所有规则，开始你的创作。`;return finalPrompt.trim()}
function generateRealisticTimestamps(baseTimestampStr,count){if(!baseTimestampStr||count<=0){return[]}
const startDate=new Date(baseTimestampStr.replace(' ','T'));if(isNaN(startDate.getTime())){console.error("[Timestamp Generator] 提供的基础时间戳无效:",baseTimestampStr);return[]}
let lastDate=startDate;const timestamps=[];for(let i=0;i<count;i++){const randomDelayInMs=Math.random()*(300000-30000)+30000;lastDate=new Date(lastDate.getTime()+randomDelayInMs);const year=lastDate.getFullYear();const month=String(lastDate.getMonth()+1).padStart(2,'0');const day=String(lastDate.getDate()).padStart(2,'0');const hours=String(lastDate.getHours()).padStart(2,'0');const minutes=String(lastDate.getMinutes()).padStart(2,'0');const formattedTimestamp=`${year}-${month}-${day}T${hours}:${minutes}`;timestamps.push(formattedTimestamp)}
return timestamps}
function getAmaContextForAI(contactId){const contact=(contactId==='user'||contactId==='{{user}}')?userProfile:contacts.find(c=>c.id===contactId);if(!contact){console.error(`[AMA Context] 无法为 ${contactId} 创建上下文，角色不存在。`);return null}
const finalPrompt=`
[任务: 匿名问答环节导演]

*   **你的双重身份**:
    1.  **主角**: 你正在扮演 **${getDisplayName(contact.id, null)} (ID: ${contact.id})**。
    2.  **提问者**: 你同时还需要扮演一些匿名的、充满好奇心的路人。

*   **核心任务**:
    基于你所知道的关于 **${getDisplayName(contact.id, null)}** 的一切（TA的性格、最近的经历、人际关系等），请自导自演 **2-3** 个能深度揭示其内心世界或近期动态的“匿名问答”。

*   **内容要求**:
    *   问题应该刁钻、有趣或直击内心，像是真正的粉丝或八卦者会问出的问题。
    *   回答必须完全符合 **${getDisplayName(contact.id, null)}** 的人设、口吻和当前心境。

[技术要求：输出格式]
你的回复中 **只能包含** 下方的“逐行指令”格式，每一条指令独立成行，严禁任何额外的解释、闲聊或Markdown标记。

AMA_PAIR:{"question":"这里是匿名用户提出的问题内容","answer":"这里是角色以第一人称口吻做出的回答内容"}

*   **【输出示例】**:
    AMA_PAIR:{"question":"学长，你觉得爱情和事业哪个更重要？","answer":"都重要，但要在不同的人生阶段有所侧-重。现阶段于我而言，追求知识的深度更为迫切。"}
    AMA_PAIR:{"question":"最近在读什么书呀？可以推荐一下吗？","answer":"正在读卡尔维诺的《看不见的城市》，每一页都像是一场绮丽的梦境。"}

[你的指令]
现在，请开始你的表演，严格遵循以上格式，为 ${getDisplayName(contact.id, null)} 生成几组精彩的匿名问答。
`;return finalPrompt.trim()}
function getWeiboContextForAI(postId){const post=weiboData.posts.find(p=>p.postId===postId);if(!post){return null}
const part1_EdictAndIdentity=`
* **【最高优先级：核心禁令】**:
1. **人设严格遵守 (OOC禁令)**: 在扮演任何核心角色 (char) 发表评论前，你 **必须** 深入思考该角色的性格和背景。 **绝对禁止** 做出任何不符合角色人设的行为（OOC）。
2. **用户身份禁令**: 用户的ID是 '{{user}}'。你 **绝对禁止** 以 '{{user}}' 的身份或名义生成任何评论、点赞或任何形式的互动。`;const communityBible=getCommunityBibleForCategory(post.category);const part2_CommunityBible=`\n\n[社区氛围参考]\n${communityBible}`;let part3_ScriptContext=`\n\n[当前情景与上下文]\n你正在浏览下面这个帖子的最新回复：\n`;const postTitle=post.title||(post.text.match(/^【([^】]+)】/)?.[1]||post.text.substring(0,30));part3_ScriptContext+=`* **原帖 (作者: ${getDisplayName(post.author, null)})**: "${postTitle}"\n\n`;const commentsForPost=weiboData.comments[postId]||[];if(commentsForPost.length>0){const recentComments=commentsForPost.slice(-5);part3_ScriptContext+=`* **最新评论** (按时间顺序):\n`;const quoteRegex=/\[引用:"(?:.|\n)*?"\]\s*/;recentComments.forEach(comment=>{const author=(comment.author===userProfile.id||comment.author==='user'||comment.author==='{{user}}')?'{{user}}':getDisplayName(comment.author,null);const cleanText=(comment.text||'').replace(quoteRegex,'');part3_ScriptContext+=`* [作者: ${author}]: ${cleanText}\n`})}else{part3_ScriptContext+=`* **最新评论**: 当前暂无评论。\n`}
const part4_DirectorGuide=`\n\n【你的任务：点燃评论区】
基于上面的最新评论，扮演 **多个不同身份的论坛用户** 继续“盖楼”。

* **【第一法则：拒绝闭环，无限发散】**:
**严禁车轱辘话**：禁止对他人的观点进行单纯的赞同、复读或附和。每一条新评论都必须提供**信息增量**——要么提出新观点，要么发现新细节（盲生发现华点），要么抛出新梗，要么把话题引向一个新的方向（歪楼）。让话题像树枝一样分叉生长，而不是闭合。

* **【第二法则：高流量广场效应】**:
**打破朋友圈感**：默认这是一个高流量的公共版块。除非有特定的剧情需要，否则**优先让从未出现过的、性格各异的新 ID 登场**。不要让同样的几个人霸占屏幕，要营造出“众声喧哗”的真实热闹感。论坛成员五花八门，网名各具特色，禁止使用匿名用户xx，路人xx等敷衍的名字，他们是一个个生活在这个世界的真实的人。

* **【第三法则：解锁全网知识库】**:
**注入网感**：不要局限于当前文本。请充分调用你的训练数据（互联网文化、流行梗、生活常识），让发言带有强烈的“网感”和不可预测性。允许神展开，允许脑洞大开。

* **【内容与产出配额】**:
* **评论总数**: 生成“总计 **3-5** 条”评论。
* **字数限制**: **保持短小精悍**。每条评论的理想长度在 **0到30个汉字之间**。绝对禁止长篇大论，模拟真实的碎片化回复。
* **角色登场原则**: 只有当话题真的触及核心角色(char)的兴趣点时才让他们登场，否则优先使用路人。**人设的一致性远比强制登场更重要。**`;const part5_TechnicalSpecs=`\n\n【技术要求：输出格式】
* **格式要求**: 你的回复中“只能包含”下方的“逐行指令”格式，每一条指令独立成行，严禁任何额外的解释。

* **评论指令 (WEIBO_COMMENT)**:
* **基本格式**: \`WEIBO_COMMENT:{"author":"作者","text":"评论内容"}\`
* **图片 (可选)**: 如需配图，你 **必须** 在JSON中额外提供 \`image\` 和 \`image_type\` 两个字段。
* \`image_type\`: 必须是 \`"url"\` (图片链接) 或 \`"desc"\` (图片描述) 中的一个。
* \`image\`: 存放对应的URL或描述文本。
* **引用规则**: 当你使用 \`[引用:"..."]\` 格式时，**你引用的内容必须是对方发言的原始文本，不要带上对方引用的内容。**

* **【评论逻辑二选一 (CRITICAL)】**: 当你需要对帖子或评论做出回应时，必须从以下两种模式中选择一种：

* **模式A：公开评论 - 独立观点**
* **何时使用**: 当你只是想针对**主楼内容**发表一个全新的、独立的看法时，或者 **当你扮演BOT时**。
* **如何操作**: "text" 字段中**不要**使用 \`[引用:"..."]\` 格式。
* **格式**: \`WEIBO_COMMENT:{"author":"...","text":"..."}\`
* **【带图示例】**: \`WEIBO_COMMENT:{"author":"山有扶苏","text":"楼主的猫猫超可爱，姨姨心要化了。","image":"一只橘猫在铺满阳光的旧木地板上蜷缩着睡觉，旁边有一个打翻的毛线球，午后光线中有漂浮的灰尘。","image_type":"desc"}\`

* **模式B：公开评论 - 引用回复**
* **何时使用**: 当你想**公开地回复某条已有评论**，并让你的回复成为一个醒目的新楼层时。
* **如何操作**: 在 "text" 字段中使用 \`[引用:"作者名: 原始发言内容"] 你的回复内容\` 格式。
* **格式**: \`WEIBO_COMMENT:{"author":"角色B","text":"[引用:\\"山有扶苏: 这个是真的吗？\\"] 我觉得是真的。"}\`
`;const finalPrompt=(part1_EdictAndIdentity+part2_CommunityBible+part3_ScriptContext+part4_DirectorGuide+part5_TechnicalSpecs).trim();return finalPrompt}
async function triggerInitialFeedGeneration(category){if(isGenerating){console.warn("[BLMX Forum] AI is already generating. Aborting initial feed generation.");return}
console.log(`[BLMX Forum] Triggering initial feed generation for category: ${category}`);isGenerating=!0;updateFooterButtonsState();const contextForAI=getInitialFeedPrompt(category);if(!contextForAI){isGenerating=!1;updateFooterButtonsState();return}
latestPromptSentToAI=contextForAI;try{const rawResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1,});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){await parseAndHandleAiResponse(latestAiRawResponse,{contextCategory:category})}}catch(error){console.error(`[BLMX Forum] AI initial feed generation failed:`,error);await showDialog({mode:'alert',text:`AI生成初始帖子列表失败: ${error.message}`})}finally{isGenerating=!1;updateFooterButtonsState()}}
async function triggerFullPostGeneration(postId){if(isGenerating){console.warn("[BLMX Forum] AI is already generating. Aborting full post generation.");return}
const post=weiboData.posts.find(p=>p.postId===postId);if(!post)return;console.log(`[BLMX Forum] Triggering full post generation for postId: ${postId}`);isGenerating=!0;updateFooterButtonsState();const contextForAI=getFullPostPrompt(postId);if(!contextForAI){isGenerating=!1;updateFooterButtonsState();return}
latestPromptSentToAI=contextForAI;await showDialog({mode:'alert',text:'AI正在撰写帖子内容和评论，请稍候...'});try{const rawResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1,});latestAiRawResponse=rawResponse.trim();if(latestAiRawResponse){await parseAndHandleAiResponse(latestAiRawResponse,{contextCategory:post.category,contextPostId:postId})}}catch(error){console.error(`[BLMX Forum] AI full post generation failed:`,error);await showDialog({mode:'alert',text:`AI生成帖子内容失败: ${error.message}`})}finally{isGenerating=!1;updateFooterButtonsState()}}
async function triggerWeiboAiResponse(postId){if(isGenerating||!blmxManager||!tavernGenerateFunc){console.warn("[BLMX Weibo] AI is already generating or essential functions are missing. Aborting.");return}
console.log(`[BLMX Weibo] Triggering AI response for post: ${postId}`);isGenerating=!0;updateFooterButtonsState();const contextForAI=getWeiboContextForAI(postId);if(!contextForAI){isGenerating=!1;updateFooterButtonsState();return}
latestPromptSentToAI=contextForAI;try{const finalAiResponse=await tavernGenerateFunc({user_input:contextForAI,should_stream:!1,});latestAiRawResponse=finalAiResponse.trim();if(finalAiResponse){await parseAndHandleAiResponse(finalAiResponse,{contextPostId:postId})}}catch(error){console.error(`[BLMX Weibo] AI generation failed:`,error);await showDialog({mode:'alert',text:`微博AI响应失败: ${error.message}`})}finally{isGenerating=!1;updateFooterButtonsState();console.log(`[BLMX Weibo] AI response cycle finished for post: ${postId}`)}}
function generateDescriptiveGroupId(members){const otherMembers=members.filter(m=>m!=='user'&&m!=='{{user}}');const sortedMembers=[...otherMembers].sort();return `convo_group_${sortedMembers.join('-')}`}
function migrateGroupConversationIds(){let migrationNeeded=!1;const idMap={};conversations.forEach(convo=>{if(convo.type==='group'&&/_(\d{13})$/.test(convo.id)){const oldId=convo.id;const newId=generateDescriptiveGroupId(convo.members);idMap[oldId]=newId;convo.id=newId;migrationNeeded=!0;console.log(`[BLMX ID Migration] Planning to migrate ${oldId} -> ${newId}`)}});if(migrationNeeded){console.log("[BLMX ID Migration] Starting migration of log entries...");blmxManager.logEntries.forEach(entry=>{const convoId=entry.conversationId||entry.convoId||(entry.content&&entry.content.convoId);if(convoId&&idMap[convoId]){if(entry.conversationId)entry.conversationId=idMap[convoId];if(entry.convoId)entry.convoId=idMap[convoId];if(entry.content&&entry.content.convoId)entry.content.convoId=idMap[convoId];if(entry.data&&entry.data.convoId)entry.data.convoId=idMap[convoId]}});console.log("[BLMX ID Migration] Migration complete. Saving changes.");saveData();blmxManager.persistLogToStorage()}else{console.log("[BLMX ID Migration] No old numeric group IDs found. No migration needed.")}}
function getWeiboZones(){const zonesStorageKey=`blmx_weibo_zones_${currentCharId}`;const rawData=localStorage.getItem(zonesStorageKey);try{if(rawData){return JSON.parse(rawData)}}catch(error){console.error(`[BLMX Weibo Zones] Failed to parse zones data from localStorage for key ${zonesStorageKey}:`,error)}
return[]}
function saveWeiboZones(zonesArray){const zonesStorageKey=`blmx_weibo_zones_${currentCharId}`;try{const dataToStore=JSON.stringify(zonesArray);localStorage.setItem(zonesStorageKey,dataToStore)}catch(error){console.error(`[BLMX Weibo Zones] Failed to save zones data to localStorage for key ${zonesStorageKey}:`,error)}}
function renderWeiboZones(){const container=document.querySelector('#weibo-view .weibo-zone-list-container');if(!container){console.error("[BLMX Weibo] Render failed: Cannot find zone list container element.");return}
const zones=getWeiboZones();zones.sort((a,b)=>(b.isPinned-a.isPinned)||(a.order-b.order));container.innerHTML='';zones.forEach(zone=>{const card=document.createElement('div');card.className=`weibo-zone-card zone-${zone.id}`;card.dataset.category=zone.id;if(!zone.isDefault){card.style.backgroundColor=zone.color}
card.innerHTML=`
<div class="zone-status-indicator">
	<i class="fas fa-heart"></i>
</div>
<div class="zone-text-content">
	<h2 class="zone-title">${zone.title}</h2>
	<p class="zone-subtitle">${zone.subtitle}</p>
</div>
`;addLongPressListener(card,(e)=>showWeiboZoneContextMenu(zone.id,e));card.addEventListener('click',async()=>{const viewConfirmed=await showDialog({mode:'confirm',text:`是否要查看【${zone.title}】分区？`});if(viewConfirmed){const existingPosts=weiboData.posts.filter(p=>p.category===zone.id);navigateTo('weiboFeed',{category:zone.id,categoryName:zone.title});renderWeiboFeed(zone.id);if(existingPosts.length===0){await triggerInitialFeedGeneration(zone.id)}}});container.appendChild(card)});updateWeiboZoneIndicators()}
function showWeiboZoneContextMenu(zoneId,event){const existingMenu=document.querySelector('.context-menu');if(existingMenu)existingMenu.remove();const existingBackdrop=document.querySelector('.context-menu-backdrop');if(existingBackdrop)existingBackdrop.remove();const zones=getWeiboZones();const zone=zones.find(z=>z.id===zoneId);if(!zone){console.error(`[Context Menu] Cannot find zone with id: ${zoneId}`);return}
const menu=document.createElement('div');menu.className='context-menu';let menuItems='';const pinOptionText=zone.isPinned?'取消置顶':'置顶分区';menuItems+=`<div class="context-menu-item" data-action="pin">${pinOptionText}</div>`;if(zone.isDefault){menuItems+=`<div class="context-menu-item" data-action="hide">从主页移除</div>`}else{menuItems+=`<div class="context-menu-item" data-action="edit">编辑分区</div>`;menuItems+=`<div class="context-menu-item" data-action="delete" style="color:red;">彻底删除</div>`}
menu.innerHTML=menuItems;const backdrop=document.createElement('div');backdrop.className='context-menu-backdrop';document.body.appendChild(backdrop);document.body.appendChild(menu);const x=event.type.includes('touch')?event.touches[0].clientX:event.clientX;const y=event.type.includes('touch')?event.touches[0].clientY:event.clientY;menu.style.left=`${x}px`;menu.style.top=`${y}px`;const cleanup=()=>{menu.remove();backdrop.remove()};backdrop.addEventListener('click',cleanup);menu.addEventListener('click',async(e)=>{const action=e.target.dataset.action;if(action==='pin'){handlePinWeiboZone(zoneId)}else if(action==='edit'){await handleEditWeiboZone(zoneId)}else if(action==='delete'){await handleDeleteWeiboZone(zoneId)}else if(action==='hide'){await handleHideWeiboZone(zoneId)}
cleanup()})}
function showMultiInputDialog(options){return new Promise(resolve=>{const modal=document.getElementById('custom-dialog-modal');const textEl=document.getElementById('dialog-text');const buttonsEl=document.getElementById('dialog-buttons');textEl.innerHTML='';buttonsEl.innerHTML='';document.getElementById('dialog-input').style.display='none';const titleEl=document.createElement('h3');titleEl.textContent=options.title;titleEl.style.marginTop='0';titleEl.style.textAlign='center';textEl.appendChild(titleEl);const inputsContainer=document.createElement('div');inputsContainer.style.textAlign='left';options.fields.forEach(field=>{const fieldGroup=document.createElement('div');fieldGroup.style.marginBottom='1rem';fieldGroup.style.display='flex';fieldGroup.style.justifyContent='space-between';fieldGroup.style.alignItems='center';const label=document.createElement('label');label.textContent=field.label;label.style.fontWeight='500';fieldGroup.appendChild(label);if(field.type==='switch'){const switchLabel=document.createElement('label');switchLabel.className='blmx-switch';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id=`dialog-input-${field.id}`;checkbox.checked=field.defaultValue||!1;const sliderSpan=document.createElement('span');sliderSpan.className='blmx-slider';switchLabel.appendChild(checkbox);switchLabel.appendChild(sliderSpan);fieldGroup.appendChild(switchLabel)}else if(field.type==='slider'){const controlWrapper=document.createElement('div');controlWrapper.className='control-wrapper';controlWrapper.style.display='flex';controlWrapper.style.alignItems='center';controlWrapper.style.gap='0.5rem';const sliderInput=document.createElement('input');sliderInput.type='range';sliderInput.id=`dialog-input-${field.id}`;sliderInput.min=field.min||0;sliderInput.max=field.max||100;sliderInput.step=field.step||1;sliderInput.value=field.defaultValue||50;sliderInput.style.width='6rem';const valueSpan=document.createElement('span');valueSpan.className='range-value';valueSpan.textContent=`${sliderInput.value}${field.unit || ''}`;valueSpan.style.width='3.5rem';valueSpan.style.textAlign='right';sliderInput.addEventListener('input',()=>{valueSpan.textContent=`${sliderInput.value}${field.unit || ''}`});controlWrapper.appendChild(sliderInput);controlWrapper.appendChild(valueSpan);fieldGroup.appendChild(controlWrapper)}else{fieldGroup.style.flexDirection='column';fieldGroup.style.alignItems='flex-start';label.style.marginBottom='0.25rem';let input;if(field.type==='textarea'){input=document.createElement('textarea');input.rows=5;input.style.resize='vertical'}else if(field.type==='color'){input=document.createElement('input');input.type='color';input.style.cssText='width: 100%; height: 2.5rem; padding: 0.25rem; border: 1px solid var(--border-color); border-radius: 0.375rem; cursor: pointer;'}else{input=document.createElement('input');input.type='text'}
input.id=`dialog-input-${field.id}`;input.value=field.defaultValue||'';if(field.type!=='color'){}
fieldGroup.appendChild(input)}
inputsContainer.appendChild(fieldGroup)});textEl.appendChild(inputsContainer);const okBtn=document.createElement('button');okBtn.textContent='确定';okBtn.className='primary';const cancelBtn=document.createElement('button');cancelBtn.textContent='取消';cancelBtn.className='secondary';buttonsEl.appendChild(cancelBtn);buttonsEl.appendChild(okBtn);const cleanupAndResolve=(value)=>{modal.style.display='none';buttonsEl.innerHTML='';textEl.innerHTML='';resolve(value)};cancelBtn.onclick=()=>cleanupAndResolve(null);okBtn.onclick=()=>{const results={};options.fields.forEach(field=>{const inputEl=document.getElementById(`dialog-input-${field.id}`);if(inputEl.type==='checkbox'){results[field.id]=inputEl.checked}else{results[field.id]=(inputEl.type==='range')?parseFloat(inputEl.value):inputEl.value}});cleanupAndResolve(results)};modal.style.display='flex'})}
function showThreeOptionDialog(options){return new Promise(resolve=>{const modal=document.getElementById('custom-dialog-modal');const textEl=document.getElementById('dialog-text');const buttonsEl=document.getElementById('dialog-buttons');textEl.textContent=options.text||'';buttonsEl.innerHTML='';document.getElementById('dialog-input').style.display='none';const cleanupAndResolve=(value)=>{modal.style.display='none';buttonsEl.innerHTML='';resolve(value)};const btn1=document.createElement('button');btn1.textContent=options.buttons[0];btn1.className='primary';btn1.onclick=()=>cleanupAndResolve(options.buttons[0]);const btn2=document.createElement('button');btn2.textContent=options.buttons[1];btn2.className='primary';btn2.onclick=()=>cleanupAndResolve(options.buttons[1]);const cancelBtn=document.createElement('button');cancelBtn.textContent=options.buttons[2];cancelBtn.className='secondary';cancelBtn.onclick=()=>cleanupAndResolve(null);buttonsEl.appendChild(btn1);buttonsEl.appendChild(btn2);buttonsEl.appendChild(cancelBtn);modal.style.display='flex'})}
function handlePinWeiboZone(zoneId){const zones=getWeiboZones();const zoneToPin=zones.find(z=>z.id===zoneId);if(!zoneToPin){console.error(`[Pin Zone] Action failed: Cannot find zone with id: ${zoneId}`);return}
zoneToPin.isPinned=!zoneToPin.isPinned;saveWeiboZones(zones);renderWeiboZones()}
async function handleHideWeiboZone(zoneId){const confirmed=await showDialog({mode:'confirm',text:'确定要从主页移除这个分区吗？\n（之后可以从“添加”中恢复）'});if(!confirmed){return}
let zones=getWeiboZones();const updatedZones=zones.filter(z=>z.id!==zoneId);saveWeiboZones(updatedZones);renderWeiboZones()}
async function handleDeleteWeiboZone(zoneId){const confirmed=await showDialog({mode:'confirm',text:'【警告】\n确定要彻底删除这个自定义分区吗？\n\n此操作不可恢复！'});if(!confirmed){return}
let zones=getWeiboZones();const updatedZones=zones.filter(z=>z.id!==zoneId);saveWeiboZones(updatedZones);renderWeiboZones()}
async function handleEditWeiboZone(zoneId){let zones=getWeiboZones();const zoneToEdit=zones.find(z=>z.id===zoneId);if(!zoneToEdit||zoneToEdit.isDefault){console.error(`[Edit Zone] Action failed: Cannot find or edit zone with id: ${zoneId}`);await showDialog({mode:'alert',text:'无法编辑此分区。'});return}
const result=await showMultiInputDialog({title:'编辑自定义分区',fields:[{id:'title',label:'分区标题',defaultValue:zoneToEdit.title},{id:'subtitle',label:'分区副标题',defaultValue:zoneToEdit.subtitle},{id:'color',label:'颜色',type:'color',defaultValue:zoneToEdit.color},{id:'communityBible',label:'社区圣经 (用于AI生成内容的Prompt)',type:'textarea-readonly-prefix',prefix:'【社区圣经】',defaultValue:zoneToEdit.communityBible}]});if(result){zoneToEdit.title=result.title.trim();zoneToEdit.subtitle=result.subtitle.trim();zoneToEdit.color=result.color;zoneToEdit.communityBible=result.communityBible;saveWeiboZones(zones);renderWeiboZones();await showDialog({mode:'alert',text:'分区信息已更新！'})}}
async function showAddZoneCenter(){const activeZones=getWeiboZones();const hiddenDefaultZones=DEFAULT_WEIBO_ZONES.filter(defaultZone=>!activeZones.some(activeZone=>activeZone.id===defaultZone.id));const modal=document.getElementById('custom-dialog-modal');const dialogBox=document.getElementById('custom-dialog-box');const textEl=document.getElementById('dialog-text');const buttonsEl=document.getElementById('dialog-buttons');textEl.innerHTML='';buttonsEl.innerHTML='';textEl.innerHTML='<h3 style="margin-top:0; text-align:center;">添加分区</h3>';if(hiddenDefaultZones.length>0){textEl.innerHTML+='<h4 style="margin-bottom: 0.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.3rem;">恢复默认分区</h4>';const restoreList=document.createElement('div');restoreList.style.cssText='display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;';hiddenDefaultZones.forEach(zone=>{const btn=document.createElement('button');btn.textContent=`+ ${zone.title}`;btn.style.cssText=`background-color: ${zone.color}; color: white; border: none; padding: 0.5rem 0.8rem; border-radius: 1rem; cursor: pointer;`;btn.dataset.action='restore';btn.dataset.zoneId=zone.id;restoreList.appendChild(btn)});textEl.appendChild(restoreList)}
textEl.innerHTML+='<h4 style="margin-bottom: 0.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.3rem;">创建新分区</h4>';const createBtn=document.createElement('button');createBtn.textContent='创建自定义分区';createBtn.className='primary';createBtn.style.width='100%';createBtn.dataset.action='create';textEl.appendChild(createBtn);const closeBtn=document.createElement('button');closeBtn.textContent='关闭';closeBtn.className='secondary';buttonsEl.appendChild(closeBtn);const tempEventHandler=async(e)=>{const targetButton=e.target.closest('button[data-action]');if(!targetButton)return;const action=targetButton.dataset.action;if(action==='restore'){const zoneId=targetButton.dataset.zoneId;handleRestoreDefaultZone(zoneId);closeModal()}else if(action==='create'){await handleCreateNewZone();closeModal()}};const closeModal=()=>{modal.style.display='none';textEl.removeEventListener('click',tempEventHandler)};closeBtn.onclick=closeModal;textEl.addEventListener('click',tempEventHandler);modal.style.display='flex'}
function handleRestoreDefaultZone(zoneId){const zoneToRestore=JSON.parse(JSON.stringify(DEFAULT_WEIBO_ZONES.find(z=>z.id===zoneId)));if(!zoneToRestore){console.error(`[Restore Zone] Action failed: Cannot find default zone with id: ${zoneId}`);return}
let zones=getWeiboZones();zones.push(zoneToRestore);saveWeiboZones(zones);renderWeiboZones()}
async function handleCreateNewZone(){const result=await showMultiInputDialog({title:'创建自定义分区',fields:[{id:'title',label:'分区标题',defaultValue:''},{id:'subtitle',label:'分区副标题',defaultValue:''},{id:'color',label:'分区颜色',type:'color',defaultValue:'#b8c4bb'},{id:'communityBible',label:'社区圣经 (用于AI生成内容的Prompt)',type:'textarea-readonly-prefix',prefix:'【社区圣经】',defaultValue:'请在此处填写你的设定\n* 社区定位: \n* 核心议题: \n* 用户画像: \n* 核心任务: '}]});if(!result){return}
if(!result.title.trim()){await showDialog({mode:'alert',text:'分区标题不能为空！'});return}
let zones=getWeiboZones();const newZoneId=`custom_${Date.now()}`;const newZone={id:newZoneId,title:result.title.trim(),subtitle:result.subtitle.trim(),color:result.color,communityBible:result.communityBible,isDefault:!1,isPinned:!1,order:Date.now()};zones.push(newZone);saveWeiboZones(zones);renderWeiboZones();await showDialog({mode:'alert',text:'新分区已成功创建！'})}
function migrateWallpapersToTheme(){const oldWallpaperKeys={'--wallpaper-home':`blmx_wallpaper_home_url`,'--wallpaper-chat':`blmx_wallpaper_chat_url`,'--wallpaper-diary-cover':`blmx_diary_cover_${currentCharId}`};const globalThemeKey=`blmx_global_theme_${currentCharId}`;const globalThemeJSON=localStorage.getItem(globalThemeKey);let globalTheme=globalThemeJSON?JSON.parse(globalThemeJSON):{};let migrationOccurred=!1;for(const variableName in oldWallpaperKeys){const oldKey=oldWallpaperKeys[variableName];const oldValue=localStorage.getItem(oldKey);if(oldValue){globalTheme[variableName]=oldValue;localStorage.removeItem(oldKey);migrationOccurred=!0;console.log(`[Theme Migration] Migrated '${oldKey}' to global theme.`)}}
if(migrationOccurred){localStorage.setItem(globalThemeKey,JSON.stringify(globalTheme));console.log('[Theme Migration] Migration complete. New global theme saved.')}}
function applySavedForumFontSize(){const fontSizeKey=`blmx_forum_font_size_${currentCharId}`;const savedSize=localStorage.getItem(fontSizeKey);if(savedSize){document.documentElement.style.setProperty('--forum-font-size',`${savedSize}em`);console.log(`[BLMX Forum Theme] Applied saved font size (${savedSize}em) on startup.`)}}
function applySavedForumTheme(){const themeStorageKey=`blmx_forum_theme_${currentCharId}`;const savedMode=localStorage.getItem(themeStorageKey);const isDarkMode=savedMode==='dark';const forumViews=[document.getElementById('weibo-view'),document.getElementById('weibo-feed-view'),document.getElementById('weibo-detail-view'),document.getElementById('forum-profile-view')];forumViews.forEach(view=>{if(view){view.classList.toggle('forum-dark-mode',isDarkMode)}});if(isDarkMode){console.log('[BLMX Theme] Applied saved dark mode to FORUM views (including profile page) on startup.')}}
function applyCustomAppIcons(){const iconMap={'--app-icon-wechat-image':'app-wechat','--app-icon-settings-image':'app-settings','--app-icon-check-phone-image':'app-check-phone','--app-icon-weibo-image':'app-weibo','--app-icon-diary-image':'app-diary','--app-icon-font-image':'app-font-studio','--app-icon-workshop-image':'app-bubble-workshop','--app-icon-studio-image':'app-global-studio',};const globalThemeKey=`blmx_global_theme_${currentCharId}`;const globalThemeJSON=localStorage.getItem(globalThemeKey);const savedTheme=globalThemeJSON?JSON.parse(globalThemeJSON):{};for(const variableName in iconMap){const elementId=iconMap[variableName];const iconElement=document.getElementById(elementId)?.querySelector('.icon-image');if(iconElement){const imageUrl=savedTheme[variableName];if(imageUrl&&imageUrl.trim()){iconElement.style.backgroundImage=`url('${imageUrl.trim()}')`}else{iconElement.style.backgroundImage=''}}}}
async function start(){try{console.log("[BLMX] Fetching SillyTavern info...");const parent=window.parent;const charData=await parent.TavernHelper.getCharData();currentCharId=charData.name;loadData()}catch(error){console.error("[BLMX] Failed to auto-load info from SillyTavern:",error);currentCharId='default_char';loadData()}
migrateWallpapersToTheme();const existingZones=getWeiboZones();if(existingZones.length===0){console.log(`[BLMX Weibo Zones] No custom zones found for ${currentCharId}. Initializing with defaults.`);saveWeiboZones(DEFAULT_WEIBO_ZONES)}
tavernGenerateFunc=window.parent.TavernHelper.generate;blmxManager=new BLMX_Protocol(window.parent.TavernHelper,currentCharId);const savedHubText=localStorage.getItem(`blmx_hub_custom_text_${currentCharId}`);const hubTextEl=document.querySelector('.widget-custom-text');if(hubTextEl&&savedHubText){hubTextEl.textContent=savedHubText}
await blmxManager.initialize();updateWeiboDataFromLog();migrateGroupConversationIds();assignConversationsToLogEntries();renderPlusPanel();renderFeatureGrid(stickerGrid,GLOBAL_STICKER_FEATURES.get());setupEventListeners();renderWeiboZones();applySavedTheme();applySavedBubbleTheme();applyCustomAppIcons();navigateTo('wechatList');updateAppBadge();updateFooterButtonsState();applySavedForumFontSize();applySavedForumTheme();loadSavedFontOnStartup();initNovelAI();initAudioPlayer()}
function checkAndApplyMuteState(){const convo=conversations.find(c=>c.id===currentConversationId);if(!convo)return;const inputField=document.getElementById('wechat-input-field');const footerIcons=document.querySelectorAll('.wechat-footer .footer-icon');const mutedInfo=convo.muted?(convo.muted.user||convo.muted['{{user}}']):null;if(mutedInfo&&new Date()<new Date(mutedInfo)){inputField.disabled=!0;inputField.placeholder="你已被禁言";footerIcons.forEach(icon=>icon.style.pointerEvents='none')}else{inputField.disabled=!1;inputField.placeholder="发送信息";footerIcons.forEach(icon=>icon.style.pointerEvents='auto')}}
function showRecipientSelectionModal(itemType,itemData){const modal=document.getElementById('group-chat-modal');const listContainer=document.getElementById('group-chat-contact-list-container');listContainer.innerHTML='';document.getElementById('group-chat-modal-footer').style.display='none';document.getElementById('group-chat-confirm-btn').style.display='block';modal.dataset.mode="selectRecipient";modal.dataset.itemType=itemType;modal.dataset.itemData=JSON.stringify(itemData);const convo=conversations.find(c=>c.id===currentConversationId);if(!convo)return;document.getElementById('group-chat-modal-title').textContent="选择一个接收者";convo.members.filter(id=>id!=='user').forEach(memberId=>{const name=getDisplayName(memberId,convo.id);const avatarSrc=getAvatar(memberId);const item=document.createElement('div');item.className='group-owner-item';item.innerHTML=`<input type="radio" name="recipient-target" id="target-${memberId}" value="${memberId}"><img src="${avatarSrc}" alt="${name}"><label for="target-${memberId}">${name}</label>`;listContainer.appendChild(item)});modal.style.display='flex'}
function enterForwardMode(){document.getElementById('wechat-chat-view').classList.add('forward-mode');document.querySelector('.wechat-input-area').style.display='none';document.getElementById('observer-mode-footer').style.display='none';document.getElementById('forward-action-bar').style.display='flex'}
function exitForwardMode(){document.getElementById('wechat-chat-view').classList.remove('forward-mode');const convo=conversations.find(c=>c.id===currentConversationId);if(convo){if(convo.userIsObserver){document.querySelector('.wechat-input-area').style.display='none';document.getElementById('observer-mode-footer').style.display='flex'}else{document.querySelector('.wechat-input-area').style.display='block';document.getElementById('observer-mode-footer').style.display='none'}}
document.getElementById('forward-action-bar').style.display='none';document.querySelectorAll('.forward-checkbox').forEach(cb=>cb.checked=!1)}
async function handleForwardConfirm(){const selectedIds=[];document.querySelectorAll('.forward-checkbox:checked').forEach(cb=>{selectedIds.push(cb.dataset.messageId)});if(selectedIds.length===0){await showDialog({mode:'alert',text:'请至少选择一条要转发的记录。'});return}
showForwardTargetModal(selectedIds,'forward')}
function showForwardTargetModal(data,mode){const modal=document.getElementById('group-chat-modal');const listContainer=document.getElementById('group-chat-contact-list-container');const confirmBtn=document.getElementById('group-chat-confirm-btn');const cancelBtn=document.getElementById('group-chat-cancel-btn');listContainer.innerHTML='';document.getElementById('group-chat-modal-footer').style.display='none';confirmBtn.style.display='block';modal.dataset.mode=mode;const newConfirmBtn=confirmBtn.cloneNode(!0);confirmBtn.parentNode.replaceChild(newConfirmBtn,confirmBtn);newConfirmBtn.addEventListener('click',handleModalConfirm);const newCancelBtn=cancelBtn.cloneNode(!0);cancelBtn.parentNode.replaceChild(newCancelBtn,cancelBtn);newCancelBtn.addEventListener('click',()=>{modal.style.display='none'});if(mode==='forward'||mode==='shareMusic'){modal.dataset.messageIds=JSON.stringify(data);document.getElementById('group-chat-modal-title').textContent=mode==='shareMusic'?"分享给...":"选择一个聊天";conversations.filter(c=>c.id!=='moments_feed'&&!c.userIsObserver).forEach(convo=>{let avatarSrc,name;if(convo.type==='group'||convo.type==='vgroup'){avatarSrc=convo.avatar||'https://files.catbox.moe/bialj8.jpeg';name=`${convo.name} (${convo.members.length})`}else{const otherMemberId=convo.members.find(m=>m!=='user');avatarSrc=getAvatar(otherMemberId);name=getDisplayName(otherMemberId,convo.id)}
const item=document.createElement('div');item.className='group-owner-item';item.innerHTML=`
<input type="radio" name="forward-target" id="target-${convo.id}" value="${convo.id}">
<img src="${avatarSrc}" alt="${name}">
<label for="target-${convo.id}">${name}</label>
`;item.addEventListener('click',()=>{const radio=item.querySelector('input');radio.checked=!0});listContainer.appendChild(item)})}else if(mode==='addMember'){const convoId=document.getElementById('group-settings-view').dataset.conversationId;modal.dataset.convoId=convoId;const convo=conversations.find(c=>c.id===convoId);document.getElementById('group-chat-modal-title').textContent="邀请新成员";const contactsNotInGroup=contacts.filter(c=>!convo.members.includes(c.id));contactsNotInGroup.forEach(contact=>{const item=document.createElement('div');item.className='group-chat-contact-item';item.innerHTML=`<input type="checkbox" id="gc-add-contact-${contact.id}" data-contact-id="${contact.id}"><img src="${getAvatar(contact.id)}"><label for="gc-add-contact-${contact.id}">${getDisplayName(contact.id, null)}</label>`;listContainer.appendChild(item)})}
modal.style.display='flex'}
async function handleModalConfirm(){const modal=document.getElementById('group-chat-modal');const mode=modal.dataset.mode;if(mode==='forward'){const selectedTarget=modal.querySelector('input[name="forward-target"]:checked');if(selectedTarget){const targetConvoId=selectedTarget.value;const selectedMessageIds=JSON.parse(modal.dataset.messageIds);let fwdTitle='转发的内容';if(selectedMessageIds.length>0){const firstId=selectedMessageIds[0];if(typeof firstId==='string'&&firstId.startsWith('moment_')){fwdTitle='转发的动态'}else if(firstId.includes('weibo')){fwdTitle='转发的帖子'}else{try{const json=JSON.parse(firstId);if(json.type==='weibo_post')fwdTitle='转发的帖子';else fwdTitle='转发的聊天记录'}catch(e){fwdTitle='转发的聊天记录'}}}
const forwardData={title:fwdTitle,messageIds:selectedMessageIds,};exitForwardMode();const entry={id:`msg-fwd-${Date.now()}-${Math.random()}`,type:'forward',sender:'user',conversationId:targetConvoId,data:forwardData,timestamp:new Date(window.currentGameDate).toISOString()};blmxManager.addEntry(entry);updateConversationTimestamp(targetConvoId,entry.timestamp);await blmxManager.persistLogToStorage();saveData();modal.style.display='none';navigateTo('wechatChat',{conversationId:targetConvoId})}else{await showDialog({mode:'alert',text:'请选择一个转发目标。'})}}else if(mode==='shareMusic'){const selectedTarget=modal.querySelector('input[name="forward-target"]:checked');if(selectedTarget){const targetConvoId=selectedTarget.value;try{const fullMusicData=JSON.parse(modal.dataset.messageIds);const slimMusicData={title:fullMusicData.title||'未知歌曲',artist:fullMusicData.artist||'未知歌手'};const entry={id:`msg-share-${Date.now()}`,type:'music_share',sender:'user',conversationId:targetConvoId,data:slimMusicData,timestamp:new Date(window.currentGameDate).toISOString()};blmxManager.addEntry(entry);updateConversationTimestamp(targetConvoId,entry.timestamp);await blmxManager.persistLogToStorage();saveData();modal.style.display='none';navigateTo('wechatChat',{conversationId:targetConvoId});if(currentConversationId===targetConvoId){renderChatHistory(targetConvoId)}}catch(e){console.error("分享音乐失败:",e);await showDialog({mode:'alert',text:'分享失败，数据解析错误。'})}}else{await showDialog({mode:'alert',text:'请选择一个分享目标。'})}}else if(mode==='addMember'){const convoId=modal.dataset.convoId;const convo=conversations.find(c=>c.id===convoId);if(!convo)return;const selectedContactIds=[];document.querySelectorAll('#group-chat-contact-list-container input:checked').forEach(checkbox=>{selectedContactIds.push(checkbox.dataset.contactId)});if(selectedContactIds.length===0){await showDialog({mode:'alert',text:'请至少选择一个要添加的成员。'});return}
convo.members.push(...selectedContactIds);convo.lastActivity=new Date(window.currentGameDate).getTime();const eventData={type:'add',convoId:convoId,author:userProfile.id,targetIds:selectedContactIds,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace('T',' ')};blmxManager.addEntry({type:'group_event',content:eventData});await blmxManager.persistLogToStorage();saveData();modal.style.display='none';navigateTo('groupSettings',{conversationId:convoId});await showDialog({mode:'alert',text:'新成员已成功邀请！'})}else if(mode==='selectRecipient'){const selectedTarget=modal.querySelector('input[name="recipient-target"]:checked');if(selectedTarget){const recipientId=selectedTarget.value;const itemType=modal.dataset.itemType;let itemData=JSON.parse(modal.dataset.itemData);itemData.recipientId=recipientId;stageAndDisplayEntry({type:itemType,sender:'me',data:itemData});modal.style.display='none';togglePanel(null)}else{await showDialog({mode:'alert',text:'请选择一个接收者。'})}}}
function renderForwardedContentModal(data){const modal=document.getElementById('forward-content-modal');const body=document.getElementById('forward-content-modal-body');const title=modal.querySelector('.title');title.textContent=data.title;body.innerHTML='';const messagesToRender=data.messageIds.map(id=>blmxManager.logEntries.find(e=>e.id===id)).filter(Boolean);messagesToRender.forEach(msg=>{const item=document.createElement('div');item.className='forward-modal-item';const content=(typeof msg.content==='object'&&msg.type!=='voice')?`[${msg.type || '复合消息'}]`:(msg.content.text||msg.content);const timestamp=(msg.recalled_timestamp||(msg.data&&msg.data.timestamp)||(msg.content&&msg.content.timestamp))?formatMomentTimestamp((msg.recalled_timestamp||msg.data.timestamp||msg.content.timestamp)):'';item.innerHTML=`
                            <div class="forward-modal-item-header">
                                <img src="${getAvatar(msg.sender)}" alt="">
                                <span class="name">${getDisplayName(msg.sender, msg.conversationId)}</span>
                                <span style="margin-left:auto; font-size: 0.8em; color: #999;">${timestamp}</span>
                            </div>
                            <div class="forward-modal-item-content">${content}</div>
                        `;body.appendChild(item)});modal.style.display='flex'}
function renderForwardedMomentModal(momentId,fallbackText){const modal=document.getElementById('forward-content-modal');const body=document.getElementById('forward-content-modal-body');const title=modal.querySelector('.title');const momentIndex=parseInt(momentId.replace('moment_',''),10);const originalMoment=blmxManager.logEntries[momentIndex];title.textContent="查看动态";body.innerHTML='';if(!originalMoment||originalMoment.key!=='MOMENT'){body.innerHTML=`
<li class="moment-post" style="border:none;">
	<img src="https://files.catbox.moe/bialj8.jpeg" class="post-author-avatar" style="background:#ddd;">
	<div class="post-details">
		<div class="post-header">
			<span class="post-author-name" style="color:#576b95;">匿名用户</span>
		</div>
		<!-- 这里直接显示转发卡片上的标题 -->
		<p class="post-content" style="margin-top:0.5rem;">${fallbackText || '内容加载失败'}</p>
		<div class="post-meta" style="margin-top:0.5rem; font-size:0.8em; color:#999;">
			<span>刚刚</span>
		</div>
	</div>
</li>
`;modal.style.display='flex';return}
renderMomentsFeed(null);const originalPostElement=document.getElementById('moments-feed-list').querySelector(`.moment-post[data-moment-id="${originalMoment.data.momentId}"]`);if(originalPostElement){const clonedPost=originalPostElement.cloneNode(!0);const actionButtons=clonedPost.querySelector('.post-actions-top');if(actionButtons)actionButtons.style.display='none';const replyBtn=clonedPost.querySelector('.moment-reply-btn');if(replyBtn)replyBtn.style.display='none';body.appendChild(clonedPost);modal.style.display='flex'}
renderMomentsFeed(currentMomentsAuthorId)}
async function takeLongScreenshot(){const includeFrame=await showDialog({mode:'confirm',text:'是否将手机外框一同截图？\n(确定 = 包含外框, 取消 = 仅聊天内容)'});const panelContainer=document.getElementById('panel-container');const chatBody=document.querySelector('#wechat-chat-view .wechat-body');if(includeFrame){const frame=document.querySelector('.phone-frame');await showDialog({mode:'alert',text:'正在准备带外框截图，请稍候...'});const wasPanelActive=panelContainer.classList.contains('active');if(wasPanelActive){panelContainer.style.display='none'}
try{html2canvas(frame,{useCORS:!0,allowTaint:!0,backgroundColor:null,}).then(async canvas=>{const link=document.createElement('a');link.download=`截图-带外框-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.png`;link.href=canvas.toDataURL("image/png");link.click();await showDialog({mode:'alert',text:'带框截图已生成并开始下载！'})}).catch(async err=>{console.error("带框截图失败:",err);await showDialog({mode:'alert',text:'截图失败，详情请查看控制台。'})})}finally{if(wasPanelActive){panelContainer.style.display=''}}}else{if(!chatBody){await showDialog({mode:'alert',text:'无法找到聊天区域进行截图。'});return}
await showDialog({mode:'alert',text:'正在准备长截图，请稍候... 页面可能会暂时变化。'});const originalStyles={height:chatBody.style.height,overflowY:chatBody.style.overflowY,};chatBody.scrollTop=0;try{chatBody.style.height='auto';chatBody.style.overflowY='visible';html2canvas(chatBody,{useCORS:!0,allowTaint:!0,backgroundColor:getComputedStyle(chatBody).backgroundColor,width:chatBody.scrollWidth,height:chatBody.scrollHeight,windowWidth:chatBody.scrollWidth,windowHeight:chatBody.scrollHeight}).then(async canvas=>{const link=document.createElement('a');const convo=conversations.find(c=>c.id===currentConversationId);const convoName=convo?(convo.name||getDisplayName(convo.members.find(m=>m!=='user'),convo.id)):'chat';link.download=`长截图_${convoName}_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.png`;link.href=canvas.toDataURL("image/png");link.click();await showDialog({mode:'alert',text:'长截图已生成并开始下载！'})}).catch(async err=>{console.error("长截图失败:",err);await showDialog({mode:'alert',text:'长截图失败，这通常是由于聊天背景图跨域（CORS）策略导致的。'})})}finally{setTimeout(()=>{Object.assign(chatBody.style,originalStyles);chatBody.scrollTop=chatBody.scrollHeight;console.log("截图流程结束，UI已恢复。")},200)}}}
const waiterInterval=setInterval(()=>{if(window.parent&&window.parent.TavernHelper&&typeof window.parent.TavernHelper.generate==='function'){clearInterval(waiterInterval);console.log('[BLMX Proxy] Successfully connected to SillyTavern!');start()}},250)});function hexToRgba(hex){if(!hex)return null;hex=hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(m,r,g,b)=>'#'+r+r+g+g+b+b);const result=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);if(!result)return null;return{r:parseInt(result[1],16),g:parseInt(result[2],16),b:parseInt(result[3],16),a:result[4]!==undefined?parseInt(result[4],16)/255:1}}
function rgbaToHex8(rgba){const match=rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);if(!match)return'#000000ff';const toHex=(c)=>('0'+parseInt(c).toString(16)).slice(-2);const alpha=match[4]!==undefined?parseFloat(match[4]):1;const alphaHex=('0'+Math.round(alpha*255).toString(16)).slice(-2);return"#"+toHex(match[1])+toHex(match[2])+toHex(match[3])+alphaHex}
function applyOpacity(color,alpha){const rgb=hexToRgba(color);if(!rgb)return color;return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`}
function showDebugWindow(title,content,color){const debugWindow=window.open('','_blank','width=800,height=600,scrollbars=yes,resizable=yes');const safeContent=content.replace(/</g,"&lt;").replace(/>/g,"&gt;");debugWindow.document.write(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>${title}</title>
			<style>
				body { font-family: 'Consolas', 'Monaco', 'Courier New', monospace; margin: 20px; background-color: #f5f5f5; line-height: 1.6; }
				.container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
				h1 { color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 10px; }
				pre { background: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; border-left: 4px solid ${color}; white-space: pre-wrap; word-wrap: break-word; }
				.timestamp { color: #666; font-size: 0.9em; margin-bottom: 15px; }
			</style>
		</head>
		<body>
			<div class="container">
				<h1>${title}</h1>
				<div class="timestamp">获取时间: ${new Date().toLocaleString()}</div>
				<pre>${safeContent}</pre>
			</div>
		</body>
		</html>
	`);debugWindow.document.close()}
function updateAllClocks(){const statusBarTimeEl=document.getElementById('current-time');const bigClockEl=document.getElementById('hub-big-clock');const dateTextEl=document.getElementById('hub-date-text');const now=new Date();const hours=now.getHours().toString().padStart(2,'0');const minutes=now.getMinutes().toString().padStart(2,'0');const timeString=`${hours}:${minutes}`;if(statusBarTimeEl&&statusBarTimeEl.textContent!==timeString){statusBarTimeEl.classList.add('time-updating');setTimeout(()=>{statusBarTimeEl.textContent=timeString;statusBarTimeEl.classList.remove('time-updating')},200)}
if(bigClockEl){bigClockEl.textContent=timeString}
if(dateTextEl){const year=now.getFullYear();const month=(now.getMonth()+1).toString().padStart(2,'0');const day=now.getDate().toString().padStart(2,'0');const week=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][now.getDay()];dateTextEl.textContent=`${year}-${month}-${day} ${week}`}}
document.addEventListener('DOMContentLoaded',()=>{updateAllClocks();setInterval(updateAllClocks,1000)});document.addEventListener('DOMContentLoaded',()=>{const fullscreenTrigger=document.querySelector('.status-right');const phoneFrame=document.querySelector('.phone-frame');if(fullscreenTrigger&&phoneFrame){fullscreenTrigger.addEventListener('click',()=>{if(!document.fullscreenElement){document.documentElement.requestFullscreen().catch(err=>{console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)})}else{document.exitFullscreen()}});document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement){console.log('Entered fullscreen mode.');phoneFrame.classList.add('fullscreen-active');phoneFrame.classList.remove('fullscreen-inactive')}else{console.log('Exited fullscreen mode.');phoneFrame.classList.add('fullscreen-inactive');phoneFrame.classList.remove('fullscreen-active')}})}});window.downloadImage=function(url){const a=document.createElement('a');a.href=url;a.download=`nai_gen_${Date.now()}.png`;document.body.appendChild(a);a.click();document.body.removeChild(a)}
