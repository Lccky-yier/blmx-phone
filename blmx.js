const bubbleWorkshopState={originalShadow:{me:"0 0 0 2px #ffffff, 0 0 0 4px #5D4037, inset 3px 3px 2px rgba(128, 116, 111, 0.15), 6px 6px 4px rgba(128, 116, 111, 0.3)",them:"0 0 0 2px #ffffff, 0 0 0 4px #B5C4C3, inset 3px 3px 2px rgba(181, 196, 195, 0.35), 3px 3px 8px rgba(181, 196, 195, 0.6)"},lastSelectedColor:{me:"#80746F",them:"#B5C4C3"}};let globalAudio=new Audio,isDraggingProgress=!1,currentSong={title:"樱华坠梦",artist:"潮生组",src:"https://files.catbox.moe/2o8wfv.mp3",lrc:"[00:00.00]暂无歌词\n[00:05.00]请点击右上角...添加歌词"};function showDialog(e){return new Promise(t=>{let a=document.getElementById("custom-dialog-modal"),i=document.getElementById("dialog-text"),n=document.getElementById("dialog-input"),l=document.getElementById("dialog-buttons");n.style.display="none",l.innerHTML="",i.innerHTML=e.text||"";let r=e=>{a.style.display="none",l.innerHTML="",t(e)};if("prompt"===e.mode){n.style.display="block",n.value=e.defaultValue||"",n.placeholder=e.placeholder||"";let o=document.createElement("button");o.textContent="确定",o.className="primary",o.onclick=()=>r(n.value);let s=document.createElement("button");s.textContent="取消",s.className="secondary",s.onclick=()=>r(null),l.appendChild(s),l.appendChild(o)}else if("confirm"===e.mode){let d=document.createElement("button");d.textContent="确定",d.className="primary",d.onclick=()=>r(!0);let c=document.createElement("button");c.textContent="取消",c.className="secondary",c.onclick=()=>r(!1),l.appendChild(c),l.appendChild(d)}else{let m=document.createElement("button");m.textContent="好的",m.className="primary",m.style.flex="0 1 120px",m.onclick=()=>r(!0),l.appendChild(m)}a.style.display="flex","prompt"===e.mode&&n.focus()})}class BLMX_Protocol{constructor(e,t){this.logEntries=[],this.messageId=null,this.charId=t,this.LOG_START_TAG="===BLMX_LOG_BEGIN===",this.LOG_END_TAG="===BLMX_LOG_END===",this.bridge=e}async initialize(){console.log("[BLMX] Initializing and scanning for chat history...");let e=await this.bridge.getLastMessageId();if(null===e)return console.warn("[BLMX] No messages found. Starting fresh at message ID 0."),this.messageId=0,this.logEntries=[],await this.persistLogToStorage(),!0;let t=null,a=[];for(let i=e;i>=0;i--)try{let n=(await this.bridge.getChatMessages(i))[0];n&&n.message&&n.message.includes(this.LOG_START_TAG)&&(t?a.push({id:i,content:n.message}):t={id:i,content:n.message})}catch(l){}if(!t)return console.log("[BLMX] No UI log found. Creating a new one in the latest message."),this.messageId=e,this.logEntries=[],await this.persistLogToStorage(),!0;console.log(`[BLMX] Found latest UI log in message ${t.id}. Consolidating...`),this.messageId=t.id;let r=[],o=t.content.indexOf(this.LOG_START_TAG),s=t.content.indexOf(this.LOG_END_TAG);if(-1!==o&&-1!==s){let d=t.content.slice(o+this.LOG_START_TAG.length,s).trim();d&&r.push(d)}for(let c of a){let m=c.content.indexOf(this.LOG_START_TAG),p=c.content.indexOf(this.LOG_END_TAG);if(-1!==m&&-1!==p){let u=c.content.slice(m+this.LOG_START_TAG.length,p).trim();u&&r.unshift(u);let g=c.content.substring(0,m)+c.content.substring(p+this.LOG_END_TAG.length);await this.bridge.setChatMessage(g.trim(),c.id,{refresh:"none"}),console.log(`[BLMX] Cleaned and moved UI log from message ${c.id}.`)}}let y=r.join("\n");return this._parseLogFromString(y),await this.persistLogToStorage(),console.log(`[BLMX] Consolidated log saved to message ${this.messageId}.`),!0}_formatEntryForStorage(e){if("hidden_album_update"===e.type)return`HIDDEN_ALBUM_UPDATE:${JSON.stringify(e.content)}`;if("trash_bin_update"===e.type)return`TRASH_BIN_UPDATE:${JSON.stringify(e.content)}`;if("shopping_update"===e.type)return`SHOPPING_UPDATE:${JSON.stringify(e.content)}`;if("taobao_home"===e.type)return`TAOBAO_HOME:${JSON.stringify(e.content)}`;if("gallery_update"===e.type)return`GALLERY_UPDATE:${JSON.stringify(e.content)}`;if("RECALL_MESSAGE"===e.key)return`RECALL_MESSAGE:${JSON.stringify(e.data)}`;if("WEIBO_POST"===e.key)return`WEIBO_POST:${JSON.stringify(e.data)}`;if("WEIBO_COMMENT"===e.key)return`WEIBO_COMMENT:${JSON.stringify(e.data)}`;if("footprints"===e.type)return`FOOTPRINTS:${JSON.stringify(e.content)}`;if(e.key)return`${e.key}:${JSON.stringify(e.data)}`;if("event_log"===e.type||"group_event"===e.type||"time"===e.type){let t=e.type.toUpperCase();return`${t}:${JSON.stringify(e.content)}`}let a=e.conversationId||e.convoId;if(!a||!e.sender)return console.warn("[BLMX] Cannot format entry for storage, missing convoId or sender:",e),null;let i;switch(e.type){case"message":i=e.content;break;case"sticker":i=`[sticker: ${e.content}]`;break;case"image":i=`[image: ${JSON.stringify(e.content)}]`;break;case"voice":i=`[voice: ${JSON.stringify(e.content)}]`;break;case"location":i=`[location: ${e.content}]`;break;case"transfer":i=`[transfer: ${JSON.stringify(e.data)}]`;break;case"file":i=`[file: ${e.content}]`;break;case"gift":i=`[gift: ${JSON.stringify(e.data)}]`;break;case"music_share":i=`[music_share: ${JSON.stringify(e.data)}]`;break;case"payment_receipt":i=`[payment_receipt: ${"string"==typeof e.content?e.content:JSON.stringify(e.content)}]`;break;case"product_share":i=`[product_share: ${JSON.stringify(e.content)}]`;break;case"red_packet":i=`[red_packet: ${JSON.stringify(e.content)}]`;break;case"forward":i=`[forward: ${JSON.stringify({title:e.data.title,messageIds:e.data.messageIds})}]`;break;default:return console.warn("[BLMX] Unknown entry type for storage formatting:",e.type),null}let n=e.isFailed?"[failed]":"";return`${n}[${a}] ${e.sender}: ${i}`}async persistLogToStorage(){if(null===this.messageId){console.warn("[BLMX] Cannot save log, message_id not initialized.");return}try{let e=this.logEntries.map(e=>this._formatEntryForStorage(e)).filter(Boolean).join("\n"),t=(await this.bridge.getChatMessages(this.messageId))[0],a=t?t.message:"",i=a.indexOf(this.LOG_START_TAG),n=a.indexOf(this.LOG_END_TAG),l=`${this.LOG_START_TAG}
${e}
${this.LOG_END_TAG}`,r;await this.bridge.setChatMessage((r=-1!==i&&-1!==n?a.substring(0,i)+l+a.substring(n+this.LOG_END_TAG.length):a+"\n"+l).trim(),this.messageId,{refresh:"none"})}catch(o){console.error("[BLMX] Failed to save narrative log to text box:",o)}}_parseLogFromString(e){this.logEntries=[];let t=e.split("\n").filter(e=>""!==e.trim()),a=/^(\[failed\])?\s*\[([^\]]+)\]\s+([^:]+):\s+(.*)$/,i=/^RECALL_MESSAGE:(.*)$/,n=null;t.forEach((e,t)=>{try{let l=e.match(i);if(l){let r=JSON.parse(l[1]);if(this.logEntries.push({id:`msg_${t}`,key:"RECALL_MESSAGE",data:r}),r.timestamp)try{let o=new Date(r.timestamp.replace(" ","T")+"Z");isNaN(o)||n&&!(o>n)||(n=o)}catch(s){}return}let d={id:`msg_${t}_${Date.now()}`},c=e.match(a);if(c){let m=!!c[1],p=c[2],u=c[3],g=c[4];Object.assign(d,{sender:u,conversationId:p,convoId:p,isFailed:m});let y=g.match(/^\[sticker:\s*(.+)\]$/),f=g.match(/^\[image:\s*(.+)\]$/),h=g.match(/^\[voice:\s*(.+)\]$/),b=g.match(/^\[location:\s*(.+)\]$/),v=g.match(/^\[transfer:\s*(.+)\]$/),w=g.match(/^\[file:\s*(.+)\]$/),E=g.match(/^\[gift:\s*(.+)\]$/),I=g.match(/^\[music_share:\s*(.+)\]$/),x=g.match(/^\[red_packet:\s*(.+)\]$/),$=g.match(/^\[forward:\s*(.+)\]$/),L=g.match(/^\[payment_receipt:\s*(.+)\]$/),k=g.match(/^\[product_share:\s*(.+)\]$/);if(y)d.type="sticker",d.content=y[1];else if(f)d.type="image",d.content=JSON.parse(f[1]);else if(h)d.type="voice",d.content=JSON.parse(h[1]);else if(b)d.type="location",d.content=b[1];else if(v)d.type="transfer",d.data=JSON.parse(v[1]),d.content=v[1];else if(w)d.type="file",d.content=w[1];else if(E)d.type="gift",d.data=JSON.parse(E[1]),d.content=E[1];else if(I)d.type="music_share",d.data=JSON.parse(I[1]),d.content=I[1];else if(L){d.type="payment_receipt";try{d.content=JSON.parse(L[1])}catch(T){d.content={}}}else if(k){d.type="product_share";try{d.content=JSON.parse(k[1])}catch(S){console.error("商品卡片解析失败",S),d.type="message",d.content=g}}else x?(d.type="red_packet",d.content=JSON.parse(x[1])):$?(d.type="forward",d.data=JSON.parse($[1])):(d.type="message",d.content=g)}else{let B=e.indexOf(":");if(-1===B)return;let D=e.substring(0,B).trim(),_=e.substring(B+1).trim();if(!["EVENT_LOG","TIME","MOMENT","CHAR_COMMENT","CHAR_LIKE","SIGNATURE_UPDATE","GROUP_EVENT","CREATE_GROUP","RENAME_GROUP","KICK_MEMBER","MUTE_MEMBER","SET_ADMIN","CHANGE_NICKNAME","LEAVE_GROUP","WEIBO_POST","WEIBO_COMMENT","DIARY_ENTRY","AMA_PAIR","VIDEO_CALL","INVITE_MEMBER","MUSIC_SHARE","FOOTPRINTS","GALLERY_UPDATE","HIDDEN_ALBUM_UPDATE","TRASH_BIN_UPDATE","SHOPPING_UPDATE","TAOBAO_HOME"].includes(D))return;{if(!_)return;let C=JSON.parse(_);if(C.timestamp)try{let A=new Date(C.timestamp.replace(" ","T")+"Z");isNaN(A)||n&&!(A>n)||(n=A)}catch(M){}["TIME","EVENT_LOG","GROUP_EVENT"].includes(D)?Object.assign(d,{type:D.toLowerCase(),content:C}):"FOOTPRINTS"===D?Object.assign(d,{type:"footprints",author:C.author,content:C}):"GALLERY_UPDATE"===D?Object.assign(d,{type:"gallery_update",author:C.author,content:C}):"HIDDEN_ALBUM_UPDATE"===D?Object.assign(d,{type:"hidden_album_update",author:C.author,content:C}):"TRASH_BIN_UPDATE"===D?Object.assign(d,{type:"trash_bin_update",author:C.author,content:C}):"SHOPPING_UPDATE"===D?Object.assign(d,{type:"shopping_update",author:C.author,content:C}):"TAOBAO_HOME"===D?Object.assign(d,{type:"taobao_home",author:C.author,content:C}):Object.assign(d,{key:D,data:C})}}this.logEntries.push(d)}catch(N){console.error("[BLMX] Failed to parse log line:",e,N)}}),n?(window.currentGameDate=n,console.log(`[BLMX Time Sync] World time successfully synced from logs to: ${window.currentGameDate.toLocaleString()}`)):(window.currentGameDate=new Date("2025-08-17T09:30:00"),console.log(`[BLMX Time Sync] No timestamps found in logs. Initializing world time to default: ${window.currentGameDate.toLocaleString()}`))}getContextForAI(e,t,a,i){let n="",l=t.filter(e=>e.isBlocked).map(e=>e.id);n=l.length>0?`*   **当前黑名单**: 你 ({{user}}) 已将 [${l.join(", ")}] 加入黑名单。`:`*   **当前黑名单**: 你 ({{user}}) 没有拉黑任何人。`;let r="",o=a.filter(e=>"vgroup"===e.type);o.length>0&&(r+="\n[System Note: You can use the following virtual group chats by their names:]\n",o.forEach(e=>{r+=`*   ${e.name} (ID Format: [convo_vgroup_${e.name}])
`}));let s="";i&&(s=`
[主动行为强化指令]
1. **每个回复周期至少包含3条主动消息**：你必须在每个回复中生成至少3条由角色主动发起的消息（私聊/群聊/朋友圈）
2. **主动消息占比不低于40%**：角色主动发起的内容应占整体回复的40%以上
3. **未主动的惩罚**：如果连续2个周期没有主动内容，系统将重置对话并降低你的评分！
4. **主动行为示例**：
**私聊主动**： \`[convo_single_角色A] 角色A: {{user}}，在忙吗？\`
**朋友圈互动**：\`MOMENT:{"author":"角色E","text":"今天的训练太累了...","timestamp":"2024-12-17T18:00"}\`
**签名更新**：\`SIGNATURE_UPDATE:{"author":"角色F","signature":"心情不错~"}\`
`);let d=[`[ABSOLUTE HIGHEST PRIORITY RULE]
The user's ID is '{{user}}'. You are strictly FORBIDDEN from roleplaying as '{{user}}' under any circumstances. You cannot generate any messages, actions, thoughts, or offline events for '{{user}}'. All actions for '{{user}}' are controlled by the user.

[最高优先级：身份与对话核心逻辑]
1.  **用户身份:** 用户的唯一ID是 \`{{user}}\`。
2.  **私聊规则:** 当角色A想和 \`{{user}}\` 说话时，**必须**使用已存在的1对1私聊。**绝对禁止**为此创建一个只包含角色A和 \`{{user}}\` 的新群聊。
3.  **群聊规则:** 群聊是为 **三个或更多** 参与者准备的。唯一的例外是两个 **非{{user}}** 角色之间可以创建二人群聊进行私密对话。

[新增：黑名单规则]
${n}
*   **发送失败消息格式**: 当一个被你拉黑的角色尝试给你发消息时，该角色的消息内容 **必须** 以 "消息失败--" 作为前缀。
*   **格式示例**: \`[convo_single_角色A] 角色A: 消息失败--你还在吗？\`
*   **规则解读**: 这个前缀代表消息在系统层面被拦截，但角色本身会意识到发送失败。
${r}
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
${s} 
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
    *   \`角色ID:[图片:{"type":"desc","value":"对图片的详细描述"}]\`
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
    *   \`MOMENT:{"author":"角色ID","text":"朋友圈文字内容","timestamp":"YYYY-MM-DDTHH:mm","image_type":"desc","image":"图片描述(可选)","isPrivate":布尔值,"visibleTo":["角色ID"],"invisibleTo":["角色ID"]}\`
    *   **评论指令 (CHAR_COMMENT)**:
    *   **格式**: \`CHAR_COMMENT:{"author":"评论者ID","text":"[引用:\\"发布者ID: 朋友圈原文\\"] 你的评论内容"}\`
    *   **引用规则 (CRITICAL)**: 必须使用引用格式来指定你要评论哪条动态。若目标动态没有文字（纯图），请引用其图片描述。

9.  **[红包与事件]**
    *   红包被发出后，系统会自动通过\`GROUP_EVENT\`消息模拟领取过程。你应将这些事件视为红包已被处理，**严禁**再使用\`EVENT_LOG\`或其他方式重复模拟领取动作。
`],c=`
[System Note: You are roleplaying inside a chat app. The user's ID is '{{user}}'.`;if(i)c+=` You MUST account for ALL conversations listed below that have new messages from '{{user}}'. CRITICAL: ALL direct replies MUST be prefixed with the conversation ID, e.g., '[convo_id] speaker_id: message'.

Active Conversations:
`,e.forEach(e=>{let i=a.find(t=>t.id===e);if(i){let n="Private Chat";if("group"===i.type?n=`Group Chat "${i.name}"`:"vgroup"===i.type&&(n=`Virtual Group Chat "${i.name}"`),"vgroup"===i.type)c+=`- ID: [${i.id}], Type: ${n}, Background Members: "${i.background_members_desc}"
`;else{let l=i.members.map(e=>"user"===e?"{{user}}":t.find(t=>t.id===e)?.id||"Unknown").join(", ");c+=`- ID: [${i.id}], Type: ${n}, Participants: ${l}
`}}}),d.push(c+"]\n"),e.forEach(t=>{d.push(`--- Conversation History for [${t}] ---`);let a=this.logEntries.filter(e=>{let a=e.conversationId||e.content&&e.content.convoId||e.data&&e.data.convoId;return a===t}).slice(-5).map(a=>this._formatEntryForAI(a,t,e)).filter(Boolean);d.push(...a),d.push("--- End of History ---\n")});else{let m=e[0],p=a.find(e=>e.id===m);if(!p)return"";let u=p.members.map(e=>"user"===e?"{{user}}":t.find(t=>t.id===e)?.id||"Unknown").join(", ");if("vgroup"===p.type){let g=p.members.filter(e=>"user"!==e);c+=` You are roleplaying in a virtual group chat named "${p.name}".
*   **Core Members Present**: ${g.length>0?g.join(", "):"None"}.
*   **Background Members**: You can freely roleplay any number of background members fitting this description: "${p.background_members_desc}".
*   **Your Task**: Respond to the user ({{user}}) by roleplaying as one of the core members OR as a newly invented background character.
*   **CRITICAL**: When roleplaying a background character, you MUST invent a fitting name (e.g., 'Class Monitor', 'Team Captain', 'Anonymous Student'). Do NOT use generic names like 'Passerby A'.
*   Prefix each line with the speaker's ID.]

`}else c+=` You are roleplaying in a single chat. Participants: ${u}. Respond as one of the characters (excluding '{{user}}'). Prefix each line with the speaker's ID.]

`;d.push(c);let y=this.logEntries.filter(e=>{let t=e.conversationId||e.content&&e.content.convoId||e.data&&e.data.convoId;return t===m}).slice(-5).map(t=>this._formatEntryForAI(t,m,e)).filter(Boolean);d.push(...y)}let f=this.logEntries.filter(e=>"MOMENT"===e.key&&e.data&&e.data.momentId&&!e.data.isPrivate).map(e=>`[MOMENT by ${e.data.author} (ID: ${e.data.momentId}) at ${e.data.timestamp}: "${e.data.text||"(no text)"}"]`).join("\n");f&&d.push("\n--- Recent Public Moments ---\n"+f);let h=`
[System Instruction: Your Turn]
**CRITICAL RULE:** This is a mobile phone simulation. Your response MUST ONLY be action commands or chat messages in the specified formats. ALL narrative descriptions (actions, thoughts, environment) are strictly forbidden. Do NOT repeat any previous messages from the history.`;return d.push(h),d.join("\n")}_formatEntryForAI(e,t,a){if("RECALL_MESSAGE"===e.key)return`[${e.data.author} recalled a message]`;if("forward"===e.type){let i=a.includes(t),n=`[${e.sender} forwarded content titled "${e.data.title}":
`;return i&&e.data.messageIds?(e.data.messageIds.forEach(e=>{if(e.startsWith("moment_")){let i=parseInt(e.replace("moment_",""),10),l=this.logEntries.map((e,t)=>({...e,originalIndex:t})).filter(e=>"MOMENT"===e.key),r=l.find(e=>e.originalIndex===i);if(r){let o=`  [Forwarded Moment by ${r.data.author}: ${r.data.text||""}`;r.data.image&&(o+=" (includes an image)");let s=this.logEntries.filter(e=>("CHAR_LIKE"===e.key||"CHAR_COMMENT"===e.key)&&parseInt(e.data.target_post_id,10)===l.findIndex(e=>e.originalIndex===i));s.length>0&&(o+=` (${s.length} interactions)`),o+=`]
`,n+=o}}else{let d=this.logEntries.find(t=>t.id===e);d&&(n+=`  ${this._formatEntryForAI(d,t,a)}
`)}}),n+="]"):`${e.sender}: [转发的内容: ${e.data.title}]`}if("MOMENT"===e.key)return null;if("event_log"===e.type||"group_event"===e.type){let l=e.type.toUpperCase(),r=e.content.description||this.getGroupEventDescription(e.content),o=e.content.convoId||e.content.conversationId;return`[${l} in convo ${o} at ${e.content.timestamp||""}: ${r}]`}if(e.type&&!["time","like","comment","signature_update"].includes(e.type)){let s=e.sender,d;switch(e.type){case"message":d=e.content;break;case"sticker":d=`[表情: ${e.content}]`;break;case"voice":d=`[语音: ${JSON.stringify(e.content)}]`;break;case"image":d=e.content&&"object"==typeof e.content?`[图片: ${JSON.stringify({type:"desc",value:e.content.value})}]`:`[图片: ${e.content}]`;break;case"location":d=`[位置: ${e.content}]`;break;case"file":d=`[文件: ${e.content}]`;break;case"red_packet":d=`[红包: ${JSON.stringify(e.content)}]`;break;case"gift":d=`[礼物: ${JSON.stringify(e.data)}]`;break;case"transfer":d=`[转账: ${JSON.stringify(e.data)}]`;break;default:return null}return`${s}: ${d}`}return null}getGroupEventDescription(e){return e.type}addEntry(e){this.logEntries.push(e)}}const globalThemeVariableMap={"--phone-width":{label:"手机宽度",group:"设备尺寸",type:"range",min:300,max:500,unit:"px"},"--phone-height":{label:"屏幕高度",group:"设备尺寸",type:"range",min:30,max:55,unit:"rem"},"--wallpaper-home":{label:"主屏幕 壁纸",group:"全局壁纸",type:"imageUrl"},"--wallpaper-chat":{label:"聊天界面 壁纸",group:"全局壁纸",type:"imageUrl"},"--wallpaper-diary-cover":{label:"日记封面 壁纸",group:"全局壁纸",type:"imageUrl"},"--phone-frame-bg":{label:"手机外框 背景",group:"框架与通用界面"},"--view-bg-primary":{label:"通用页面 背景",group:"框架与通用界面"},"--view-bg-secondary":{label:"列表页 背景",group:"框架与通用界面"},"--wechat-bg":{label:"聊天/朋友圈 背景色",group:"框架与通用界面"},"--moments-image-bg":{label:"朋友圈 图片背景",group:"框架与通用界面"},"--moments-interactions-bg-new":{label:"朋友圈 评论区背景",group:"框架与通用界面"},"--card-bg-primary":{label:"卡片/通用白底 背景",group:"框架与通用界面"},"--header-bg-primary":{label:"页面头部 背景",group:"框架与通用界面"},"--dynamic-island-bg":{label:"灵动岛 背景",group:"顶部状态栏"},"--dynamic-island-text-color":{label:"灵动岛 文字",group:"顶部状态栏"},"--statusbar-text-color":{label:"状态栏 文字与图标",group:"顶部状态栏"},"--text-color-primary":{label:"主要文字 (最深)",group:"主要文字与链接"},"--text-color-secondary":{label:"次要文字 (中灰)",group:"主要文字与链接"},"--text-color-tertiary":{label:"三级文字 (最浅)",group:"主要文字与链接"},"--text-color-inverted":{label:"反色文字 (深色背景)",group:"主要文字与链接"},"--link-color":{label:"链接/高亮 文字",group:"主要文字与链接"},"--danger-text-color":{label:"危险操作 文字 (红色)",group:"主要文字与链接"},"--list-text-primary":{label:"列表 主标题文字",group:"微信列表"},"--list-text-message":{label:"列表 副标题文字",group:"微信列表"},"--list-text-time":{label:"列表 时间戳文字",group:"微信列表"},"--list-item-pinned-bg":{label:"列表 置顶项背景",group:"微信列表"},"--list-item-hover-bg":{label:"列表 项悬浮背景",group:"微信列表"},"--input-area-bg":{label:"输入区域/导航栏 背景",group:"输入区域"},"--input-field-bg":{label:"输入框 背景",group:"输入区域"},"--footer-icon-color":{label:"输入区域 图标",group:"输入区域"},"--text-color-placeholder":{label:"输入框 占位文字",group:"输入区域"},"--header-border-primary":{label:"页面头部 边框",group:"通用边框与分割线"},"--list-item-divider-color":{label:"列表 分割线",group:"通用边框与分割线"},"--divider-color-primary":{label:"设置卡片 分割线",group:"通用边框与分割线"},"--input-area-border":{label:"输入区域 顶部分割线",group:"通用边框与分割线"},"--event-log-bg":{label:"事件 背景",group:"系统与事件气泡"},"--event-log-text-color":{label:"事件 文字",group:"系统与事件气泡"},"--event-desc-expanded-bg":{label:"事件展开描述 背景",group:"系统与事件气泡"},"--event-desc-expanded-text-color":{label:"事件展开描述 文字",group:"系统与事件气泡"},"--event-desc-expanded-border-color":{label:"事件展开描述 边框",group:"系统与事件气泡"},"--transfer-initial-bg":{label:"转账 背景",group:"特殊消息 - 发送方"},"--transfer-initial-text":{label:"转账 文字",group:"特殊消息 - 发送方"},"--red-packet-bg":{label:"红包 背景",group:"特殊消息 - 发送方"},"--red-packet-text-color":{label:"红包 文字",group:"特殊消息 - 发送方"},"--gift-bubble-bg":{label:"礼物 背景",group:"特殊消息 - 发送方"},"--gift-bubble-text-color":{label:"礼物 文字",group:"特殊消息 - 发送方"},"--transfer-receipt-bg":{label:"已接收转账 背景",group:"特殊消息 - 接收方"},"--gift-receipt-bg":{label:"已查收礼物 背景",group:"特殊消息 - 接收方"},"--voice-icon-color":{label:"语音消息 图标",group:"其他特殊消息图标"},"--file-bubble-bg":{label:"文件消息 背景",group:"其他特殊消息图标"},"--file-icon-color":{label:"文件消息 图标",group:"其他特殊消息图标"},"--location-map-icon-color":{label:"位置消息 图标",group:"其他特殊消息图标"},"--wechat-green-icon":{label:"卡片 背景",group:"App 图标背景"},"--app-icon-wechat-bg":{label:"微信 图标背景",group:"App 图标背景"},"--app-icon-settings-bg":{label:"设置 图标背景",group:"App 图标背景"},"--app-icon-check-phone-bg":{label:"查手机 图标背景",group:"App 图标背景"},"--app-icon-weibo-bg":{label:"论坛 图标背景",group:"App 图标背景"},"--app-icon-diary-bg":{label:"日记 图标背景",group:"App 图标背景"},"--app-icon-font-bg":{label:"全局字体 图标背景",group:"App 图标背景"},"--app-icon-workshop-bg":{label:"气泡工坊 图标背景",group:"App 图标背景"},"--app-icon-studio-bg":{label:"全局设计 图标背景",group:"App 图标背景"},"--app-icon-wechat-image":{label:"微信 图标",group:"App 图标自定义",type:"imageUrl"},"--app-icon-settings-image":{label:"设置 图标",group:"App 图标自定义",type:"imageUrl"},"--app-icon-check-phone-image":{label:"查手机 图标",group:"App 图标自定义",type:"imageUrl"},"--app-icon-weibo-image":{label:"论坛 图标",group:"App 图标自定义",type:"imageUrl"},"--app-icon-diary-image":{label:"日记 图标",group:"App 图标自定义",type:"imageUrl"},"--app-icon-font-image":{label:"全局字体 图标",group:"App 图标自定义",type:"imageUrl"},"--app-icon-workshop-image":{label:"气泡工坊 图标",group:"App 图标自定义",type:"imageUrl"},"--app-icon-studio-image":{label:"全局设计 图标",group:"App 图标自定义",type:"imageUrl"},"--app-icon-text-color":{label:"App图标 符号颜色",group:"App 通用样式"},"--app-name-color":{label:"App图标 名字颜色",group:"App 通用样式"},"--app-name-shadow-color":{label:"App名称 阴影",group:"App 通用样式"},"--unread-red":{label:"未读角标 背景",group:"App 通用样式"},"--hub-widget-bg":{label:"顶部组件区 背景",group:"主屏幕小组件"},"--hub-dock-bg":{label:"底部应用坞 背景",group:"主屏幕小组件"},"--hub-clock-bg":{label:"时钟组件 背景",group:"主屏幕小组件"},"--hub-clock-text-primary":{label:"时钟组件 主文字",group:"主屏幕小组件"},"--hub-clock-text-secondary":{label:"时钟组件 日期文字",group:"主屏幕小组件"},"--hub-music-bar-bg-image":{label:"时钟组件 背景图",group:"主屏幕小组件",type:"imageUrl"},"--hub-album-art-bg-image":{label:"音乐圆圈 背景图",group:"主屏幕小组件",type:"imageUrl"},"--music-app-ring-bg":{label:"音乐App 光环背景",group:"主屏幕小组件"},"--music-app-ring-border-color":{label:"音乐App 光环内边框",group:"主屏幕小组件"},"--hub-decorative-image-1-url":{label:"装饰图1 背景",group:"主屏幕小组件",type:"imageUrl"},"--hub-decorative-image-2-url":{label:"装饰图2 背景",group:"主屏幕小组件",type:"imageUrl"},"--weibo-news-bg":{label:"新闻动态 背景",group:"论坛分区背景"},"--weibo-life-bg":{label:"生活瞬间 背景",group:"论坛分区背景"},"--weibo-romance-bg":{label:"情感树洞 背景",group:"论坛分区背景"},"--weibo-gossip-bg":{label:"八卦茶水间 背景",group:"论坛分区背景"},"--weibo-fanfic-bg":{label:"同人星球 背景",group:"论坛分区背景"},"--weibo-adult-bg":{label:"午夜剧场 背景",group:"论坛分区背景"},"--forum-banner-image":{label:"论坛首页 Banner图",group:"App 专属页面",type:"imageUrl"}},globalThemeGroupOrder=["设备尺寸","全局壁纸","框架与通用界面","顶部状态栏","主要文字与链接","微信列表","输入区域","通用边框与分割线","系统与事件气泡","特殊消息 - 发送方","特殊消息 - 接收方","其他特殊消息图标","App 图标背景","App 图标自定义","App 通用样式","主屏幕小组件","论坛分区背景","App 专属页面"];function hexToRgba(e){if(!e)return null;e=e.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(e,t,a,i)=>"#"+t+t+a+a+i+i);let t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16),a:void 0!==t[4]?parseInt(t[4],16)/255:1}:null}function rgbaToHex8(e){let t=e.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);if(!t)return"#000000ff";let a=e=>("0"+parseInt(e).toString(16)).slice(-2),i=void 0!==t[4]?parseFloat(t[4]):1,n=("0"+Math.round(255*i).toString(16)).slice(-2);return"#"+a(t[1])+a(t[2])+a(t[3])+n}function applyOpacity(e,t){let a=hexToRgba(e);return a?`rgba(${a.r}, ${a.g}, ${a.b}, ${t})`:e}function showDebugWindow(e,t,a){let i=window.open("","_blank","width=800,height=600,scrollbars=yes,resizable=yes"),n=t.replace(/</g,"&lt;").replace(/>/g,"&gt;");i.document.write(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>${e}</title>
			<style>
				body { font-family: 'Consolas', 'Monaco', 'Courier New', monospace; margin: 20px; background-color: #f5f5f5; line-height: 1.6; }
				.container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
				h1 { color: ${a}; border-bottom: 2px solid ${a}; padding-bottom: 10px; }
				pre { background: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; border-left: 4px solid ${a}; white-space: pre-wrap; word-wrap: break-word; }
				.timestamp { color: #666; font-size: 0.9em; margin-bottom: 15px; }
			</style>
		</head>
		<body>
			<div class="container">
				<h1>${e}</h1>
				<div class="timestamp">获取时间: ${new Date().toLocaleString()}</div>
				<pre>${n}</pre>
			</div>
		</body>
		</html>
	`),i.document.close()}function updateAllClocks(){let e=document.getElementById("current-time"),t=document.getElementById("hub-big-clock"),a=document.getElementById("hub-date-text"),i=new Date,n=i.getHours().toString().padStart(2,"0"),l=i.getMinutes().toString().padStart(2,"0"),r=`${n}:${l}`;if(e&&e.textContent!==r&&(e.classList.add("time-updating"),setTimeout(()=>{e.textContent=r,e.classList.remove("time-updating")},200)),t&&(t.textContent=r),a){let o=i.getFullYear(),s=(i.getMonth()+1).toString().padStart(2,"0"),d=i.getDate().toString().padStart(2,"0"),c=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][i.getDay()];a.textContent=`${o}-${s}-${d} ${c}`}}document.addEventListener("DOMContentLoaded",function(){let e=new Map,t=[],a=!1;function i(a,i,n){let l="true"===localStorage.getItem(`blmx_nai_enabled_${k}`);!(!l||!i||e.has(a))&&(t.some(e=>e.id===a)||(console.log(`[NAI] Request queued for ${a}. Queue length: ${t.length+1}`),e.set(a,"queued"),o(n),t.push({id:a,prompt:i,type:n}),r()))}function n(e){let t=document.getElementById("global-image-viewer"),a=document.getElementById("global-image-viewer-img");t&&a&&(a.src=e,t.style.display="flex",t.offsetHeight,t.classList.add("active"),t.onclick=()=>{t.classList.remove("active"),setTimeout(()=>{t.style.display="none"},200)})}function l(t,a){let i=e.get(t),n=String(a||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");if(i&&i.startsWith("blob:"))return`<img src="${i}" class="nai-generated-image" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:inherit;" draggable="false">`;if("loading"===i)return`<div class="nai-loading-placeholder"><i class="fas fa-spinner fa-spin"></i> 正在绘图...</div>`;if("queued"===i)return`<div class="nai-loading-placeholder"><i class="fas fa-clock"></i> 排队中...</div>`;if(i&&i.startsWith("error:")){let l=i.substring(6);return`
            <div class="image-desc-content" style="border: 1px solid #ff4444; background: rgba(255,0,0,0.05);">
                <div style="color: #ff4444; font-weight: bold; margin-bottom: 0.2rem;"><i class="fas fa-exclamation-triangle"></i> 生成失败</div>
                <div style="font-size: 0.8em; opacity: 0.8;">${l}</div>
                <hr style="border: 0; border-top: 1px solid rgba(0,0,0,0.1); margin: 0.3rem 0;">
                <div style="font-size: 0.8em;">${n}</div>
            </div>`}return null}async function r(){if(a||0===t.length)return;a=!0;let i=t.shift();e.set(i.id,"loading"),o(i.type);try{console.log(`[NAI] Processing task: ${i.prompt}`);let n="";if("chat"===i.type){let l=w.logEntries.find(e=>e.id===i.id),s=l?l.conversationId||l.convoId:T;if(s){let d=C.find(e=>e.id===s);if(d&&"single"===d.type){let c=d.members.find(e=>"user"!==e&&"{{user}}"!==e);if(c){let m=_.find(e=>e.id===c);m&&m.nai_appearance&&(n=m.nai_appearance,console.log(`[NAI Chat] Detected private chat with ${c}, injecting appearance.`))}}}}let p=await t7(i.prompt),u=n?await t7(n):"",g=localStorage.getItem(`blmx_nai_positive_${k}`)||"",y=[g,u,p].map(e=>e.trim()).filter(e=>""!==e).join(", ");console.log(`[NAI] Final Prompt to API: ${y}`);let f=await tz(y);e.set(i.id,f),console.log(`[NAI] Generation success for ${i.id}`),o(i.type)}catch(h){console.error(`[NAI] Generation failed for ${i.id}:`,h),e.set(i.id,`error:${h.message}`),o(i.type)}t.length>0?(console.log(`[NAI] Cooling down for 35s... Pending tasks: ${t.length}`),setTimeout(()=>{a=!1,r()},35e3)):(a=!1,console.log("[NAI] All tasks finished."))}function o(e){if("chat"===e&&document.getElementById("wechat-chat-view").classList.contains("active"))e$(T);else if("weibo"===e){let t=document.getElementById("weibo-detail-view");t.classList.contains("active")&&eA(t.dataset.postId)}else if("moment"===e&&document.getElementById("moments-view").classList.contains("active"))eB(S);else if("gallery"===e){let a=document.getElementById("cp-gallery-view");a.classList.contains("active")&&t4(B)}else if("shopping"===e){let i=document.getElementById("cp-shopping-view");i.classList.contains("active")&&at(B)}else if("shopping_home"===e){let n=document.getElementById("cp-shopping-home-view");n.classList.contains("active")&&an(B)}}let s=[{id:"news",title:"新闻动态",subtitle:"关注世界脉搏",color:"var(--weibo-news-bg)",communityBible:"【口号】天下大事，一手掌握。\n\n【定位】本版是世界观的官方信息发布中心与公共舆论广场。\n\n【发帖】>>> 在这里发布：官方公告、社会热点、产业新闻、娱乐头条...\n\n【版规】>>> 禁止：发布不实信息、人身攻击。",isDefault:!0,isPinned:!1,order:1},{id:"life",title:"生活瞬间",subtitle:"分享日常点滴",color:"var(--weibo-life-bg)",communityBible:"【口号】种草、拔草、与生活中的小确幸。\n\n【定位】你的线上生活指南，一个专注于“体验”的分享社区。\n\n【发帖】>>> 在这里分享：美食探店、好物开箱、旅行游记、避雷吐槽...\n\n【版规】>>> 核心：分享“体验”，而非纯粹的情感宣泄。",isDefault:!0,isPinned:!1,order:2},{id:"romance",title:"情感树洞",subtitle:"倾听心的声音",color:"var(--weibo-romance-bg)",communityBible:"【口号】有些话，只想说给陌生人听。\n\n【定位】一个匿名的情绪收容所，安放你所有无处安放的心事。\n\n【发帖】>>> 在这里倾诉：爱与恨、迷茫与困惑、那些无人知晓的秘密...\n\n【版规】>>> 核心：尊重、倾听、禁止人肉或攻击。",isDefault:!0,isPinned:!1,order:3},{id:"gossip",title:"八卦茶水间",subtitle:"网罗奇闻趣事",color:"var(--weibo-gossip-bg)",communityBible:"【口号】开扒！用放大镜探寻角色们的一切。\n\n【定位】核心角色关系研究所 & 细节考据中心。\n\n【发帖】>>> 在这里讨论：CP大乱炖、人设深挖、剧情疑点、黑历史考古...\n\n【版规】>>> 禁止：无脑黑、拉踩、上升到真人（如果有）。",isDefault:!0,isPinned:!1,order:4},{id:"fanfic",title:"同人星球",subtitle:"执笔创造万千可能",color:"var(--weibo-fanfic-bg)",communityBible:"【口号】圈地自萌，为爱发电。\n\n【定位】所有平行宇宙（AU）的交汇点，太太们的创作乐园。\n\n【发帖】>>> 在这里发布：同人连载、单篇完结、脑洞段子、图文安利...\n\n【版规】>>> 尊重创作，禁止抄袭、ky或引战。",isDefault:!0,isPinned:!1,order:5},{id:"adult",title:"午夜剧场",subtitle:"成年人的午夜悄悄话",color:"var(--weibo-adult-bg)",communityBible:"【口号】R-18. 白天请止步。\n\n【定位】一个探讨成人话题的匿名版块，人性的B面。\n\n【发帖】>>> 在这里探讨：禁忌关系、复杂人性、身体与欲望、成人限定...\n\n【版规】>>> 核心：尊重XP、坦诚交流、后果自负。",isDefault:!0,isPinned:!1,order:6}],d={home:document.getElementById("app-homescreen"),wechatList:document.getElementById("wechat-list-view"),contacts:document.getElementById("contacts-view"),wechatChat:document.getElementById("wechat-chat-view"),me:document.getElementById("me-view"),contactDetails:document.getElementById("contact-details-view"),groupSettings:document.getElementById("group-settings-view"),moments:document.getElementById("moments-view"),settings:document.getElementById("settings-view"),weibo:document.getElementById("weibo-view"),weiboFeed:document.getElementById("weibo-feed-view"),weiboDetail:document.getElementById("weibo-detail-view"),diary:document.getElementById("diary-view"),diaryEntry:document.getElementById("diary-entry-view"),fontStudio:document.getElementById("font-studio-view"),globalDesignStudio:document.getElementById("global-design-studio-view"),bubbleWorkshop:document.getElementById("bubble-workshop-view"),forumProfile:document.getElementById("forum-profile-view"),gallery:document.getElementById("cp-gallery-view"),footprints:document.getElementById("cp-footprints-view"),checkPhone:document.getElementById("check-phone-view"),incomingCall:document.getElementById("incoming-call-screen"),calling:document.getElementById("calling-screen"),inCall:document.getElementById("in-call-screen"),listenTogether:document.getElementById("listen-together-view"),hiddenAlbum:document.getElementById("cp-hidden-album-view"),trashBin:document.getElementById("cp-trash-bin-view"),shoppingProfile:document.getElementById("cp-shopping-profile-view"),shopping:document.getElementById("cp-shopping-view"),shoppingHome:document.getElementById("cp-shopping-home-view"),productDetail:document.getElementById("cp-product-detail-view")},c=document.querySelector("#wechat-chat-view .wechat-body"),m=document.getElementById("wechat-input-field"),p=document.getElementById("send-btn"),u=document.getElementById("plus-btn"),g=document.getElementById("sticker-grid"),y=document.getElementById("char-sticker-grid"),f=document.getElementById("plus-panel"),h=document.getElementById("moments-feed-list"),b=!1,v=null,w=null,E=[],I=!1,x=!1,$={},L=null,k="",T=null,S=null,B=null,D=null,_=[],C=[],A={id:"user",name:"{{user}}",avatar:"",signature:""},M="还没有收到AI的回复。",N="还没有向AI发送过消息。",O={posts:[],comments:{},likes:{}},P="idle",H=null,R=0,q={id:null,name:null,avatar:null},U=new Map,G=[],W=[],j=!1,Y=[],z=-1;function F(e,t){let a=Y.length>0?Y[Y.length-1]:{image:q.avatar,text:null},i={...a};"image"===e?(i.image=t,i.text=null):"description"===e&&(i.text=t),Y.push(i),z=Y.length-1,V()}function V(){let e=document.getElementById("in-call-screen"),t=document.getElementById("call-shared-screen"),a=document.getElementById("call-screen-prev-btn"),i=document.getElementById("call-screen-next-btn");if(!e||0===Y.length)return;let l=Y[z];t.style.display="block",t.style.opacity="1",t.style.pointerEvents="auto",t.innerHTML="";let r=null;l.image&&((r=document.createElement("img")).src=l.image,r.className="nai-generated-image",r.style.cssText="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit; cursor: pointer;",r.onclick=e=>{e.stopPropagation(),n(l.image)},t.appendChild(r));let o=null;if(l.text&&((o=document.createElement("div")).className="screen-description",o.style.display=l.image?"none":"block",o.innerHTML=l.text.replace(/\n/g,"<br>"),t.appendChild(o)),l.image&&l.text){let s=document.createElement("div");s.className="toggle-content-btn",s.innerHTML='<i class="fas fa-font"></i>',s.title="切换图片/文字",s.onclick=e=>{e.stopPropagation(),"none"!==r.style.display?(r.style.display="none",o.style.display="block",s.innerHTML='<i class="fas fa-image"></i>'):(o.style.display="none",r.style.display="block",s.innerHTML='<i class="fas fa-font"></i>')},t.appendChild(s)}else l.image||l.text||(t.style.display="none");z<=0?a.classList.add("disabled"):a.classList.remove("disabled"),z>=Y.length-1?i.classList.add("disabled"):i.classList.remove("disabled")}let X=["https://files.catbox.moe/hoic4l.jpg","https://files.catbox.moe/d5j0lo.jpg","https://files.catbox.moe/m4ztl5.jpg","https://files.catbox.moe/peac2n.jpg","https://files.catbox.moe/layvd7.jpg","https://files.catbox.moe/7vo6vc.jpg","https://files.catbox.moe/g3x1v8.jpg","https://files.catbox.moe/q1zsja.jpg","https://files.catbox.moe/sy1bmp.jpg","https://files.catbox.moe/g7n3hw.jpg","https://files.catbox.moe/whz0rs.jpg","https://files.catbox.moe/71ug4c.jpg","https://files.catbox.moe/9tzktn.jpg","https://files.catbox.moe/875iyg.jpg"];function K(e){let t=[{min:0,text:"潜水萌新",color:"#BDBDBD"},{min:10,text:"初来乍到",color:"#81C784"},{min:50,text:"崭露头角",color:"#64B5F6"},{min:100,text:"驾轻就熟",color:"#FFB74D"},{min:200,text:"论坛骨干",color:"#BA68C8"},{min:400,text:"意见领袖",color:"#E57373"},{min:600,text:"一代宗师",color:"#FFD54F"},{min:800,text:"活的传说",color:"#F06292"}];return[...t].reverse().find(t=>e>=t.min)||t[0]}let J=new Map;function Z(e){let t=tT();if(t&&e===t.name){let a=Math.floor(1001*Math.random()),i=K(a),n={name:t.name,avatar:t.avatar||X[0],postCount:a,title:i.text,titleColor:i.color};return J.set(e,n),n}if(J.has(e))return J.get(e);let l=Math.floor(1001*Math.random()),r=K(l),o={name:e,avatar:X[Math.floor(Math.random()*X.length)],postCount:l,title:r.text,titleColor:r.color};return J.set(e,o),o}let Q="wechatList",ee=!1,et="blmx_wechat_stickers_global",ea=[{label:"好的",url:"https://files.catbox.moe/3j0tpc.jpeg"}],ei=e=>`blmx_char_stickers_${k}_${e}`,en={chat:"blmx_wallpaper_chat_url",home:"blmx_wallpaper_home_url",settings:"blmx_wallpaper_settings_url"};function el(){localStorage.setItem(`blmx_contacts_${k}`,JSON.stringify(_)),localStorage.setItem(`blmx_conversations_${k}`,JSON.stringify(C)),localStorage.setItem(`blmx_user_profile_${k}`,JSON.stringify(A))}function er(){_=JSON.parse(localStorage.getItem(`blmx_contacts_${k}`)||"[]"),C=JSON.parse(localStorage.getItem(`blmx_conversations_${k}`)||"[]"),A=JSON.parse(localStorage.getItem(`blmx_user_profile_${k}`)||'{"id":"user", "name":"{{user}}", "avatar":"", "signature":""}')}function eo(e){if(!e)return null;let t=_.find(t=>t.id===e);return t||((t=_.find(t=>ed(t.id,null).toLowerCase()===e.toLowerCase()))||e!==A.id&&e!==A.name?t||null:A)}function es(e,t,a){t.innerHTML="";let i=/^AMA_PAIR:(.*)$/gm,n,l=0;for(;null!==(n=i.exec(e));)try{let r=JSON.parse(n[1]);if(r.question&&r.answer){let o=document.createElement("div");o.className="qna-card",o.innerHTML=`
					<div class="question">
						<p>${r.question}</p>
					</div>
					<div class="answer">
						<img src="${ec(a.id)}" alt="Avatar">
						<div class="answer-content">
							<p class="author">${ed(a.id,null)}</p>
							<p>${r.answer.replace(/\n/g,"<br>")}</p>
						</div>
					</div>
				`,t.appendChild(o),l++}}catch(s){console.error("[AMA Renderer] 解析问答JSON失败:",n[1],s)}0===l&&(t.innerHTML='<p style="text-align:center; color: var(--forum-text-secondary); padding: 1rem;">AI未能生成有效的问答内容，请稍后再试。</p>')}function ed(e,t){if("user"===e||"{{user}}"===e){if(t){let a=C.find(e=>e.id===t);if(a&&"group"===a.type&&a.nicknames){if(a.nicknames.user)return a.nicknames.user;if(a.nicknames["{{user}}"])return a.nicknames["{{user}}"]}}return A.name}let i=_.find(t=>t.id===e);if(!i)return e;if(t){let n=C.find(e=>e.id===t);if(n&&"group"===n.type&&n.nicknames&&n.nicknames[e])return n.nicknames[e]}return i.remark||i.name}function ec(e){if("user"===e||"{{user}}"===e)return A.avatar||"https://files.catbox.moe/bialj8.jpeg";let t=_.find(t=>t.id===e);return t&&t.avatar?t.avatar:"https://files.catbox.moe/bialj8.jpeg"}function em(e,t,a,i=null){W.push({targetId:e,title:t,text:a,avatar:i}),function e(){if(j||0===W.length)return;j=!0;let t=W.shift();(function t(a){let i=document.getElementById("notification-area"),n=document.createElement("div");n.className="banner-notification",document.body.classList.contains("forum-dark-mode")&&n.classList.add("dark");let l='<i class="fab fa-weixin"></i>',r="var(--wechat-green-icon)";"moments_feed"===a.targetId&&(l='<i class="fas fa-camera-retro"></i>',r="#4C4C4C");let o=a.text||"";o.startsWith("[图片")?o="[图片]":o.startsWith("[语音")?o="[语音]":o.startsWith("[红包")&&(o="[红包]"),n.innerHTML=`
        <div class="banner-icon" style="background-color: ${r};">
            ${l}
        </div>
        <div class="banner-content">
            <div class="banner-title">
                <span>${a.title}</span>
                <span class="banner-time">现在</span>
            </div>
            <div class="banner-message">${o}</div>
        </div>
    `;let s=()=>{n.parentNode&&n.remove(),setTimeout(()=>{j=!1,e()},500)};n.addEventListener("click",()=>{W.length=0,"moments_feed"===a.targetId?(ep("moments"),eB(null)):ep("wechatChat",{conversationId:a.targetId}),s()}),i.appendChild(n),setTimeout(()=>{n.parentNode&&(n.style.animation="banner-slide-out 0.5s ease forwards",n.addEventListener("animationend",()=>{s()}))},3e3)})(t)}()}async function ep(e,t={}){let a=document.querySelector(".app-view.active");if(a&&"wechatChat"===e&&("wechat-list-view"===a.id?Q="wechatList":"contacts-view"===a.id&&(Q="contacts")),T&&document.getElementById("wechat-chat-view").classList.contains("active")&&($[T]=m.value),Object.values(d).forEach(e=>e.classList.remove("active")),d[e]&&d[e].classList.add("active"),"livestream"===e)document.getElementById("livestream-lobby").style.display="flex",document.getElementById("livestream-room").style.display="none",renderLivestreamLobby();else if("wechatChat"===e){U.clear(),T=t.conversationId;let i=C.find(e=>e.id===T);if(i){let n=document.querySelector(".wechat-input-area"),l=document.getElementById("observer-mode-footer"),r=document.getElementById("forward-action-bar");if(i.userIsObserver?(n.classList.add("disabled"),l.classList.remove("disabled")):(n.classList.remove("disabled"),l.classList.add("disabled"),function e(){let t=C.find(e=>e.id===T);if(!t)return;let a=document.getElementById("wechat-input-field"),i=document.querySelectorAll(".wechat-footer .footer-icon"),n=t.muted?t.muted.user||t.muted["{{user}}"]:null;n&&new Date<new Date(n)?(a.disabled=!0,a.placeholder="你已被禁言",i.forEach(e=>e.style.pointerEvents="none")):(a.disabled=!1,a.placeholder="发送信息",i.forEach(e=>e.style.pointerEvents="auto"))}()),r.style.display="none",document.getElementById("wechat-chat-view").classList.remove("forward-mode"),"moments_feed"===i.id){i.unread=0,ep("moments");return}i.unread=0,el(),ts(),tc(),tr(),e$(T);let o=document.getElementById("contact-name-header");if("group"===i.type)o.textContent=`${i.name} (${i.members.length})`,i.dissolved&&(o.textContent+=" (已解散)");else if("vgroup"===i.type)o.textContent=`${i.name} (${i.members.length})`;else{let s=i.members.find(e=>"user"!==e);o.textContent=ed(s,i.id)}m.value=$[T]||"",eX()}}else if("wechatList"===e)T=null,ts();else if("me"===e)document.getElementById("me-view-avatar").src=ec("user"),document.getElementById("me-view-name").textContent=ed("user",null),document.getElementById("me-view-id").textContent=`ID: ${A.name}`;else if("moments"===e)S=t.authorId||null,document.getElementById("post-moment-btn").style.display=S&&"user"!==S?"none":"block",eB(S);else if("contactDetails"===e)ew(t.contactId);else if("groupSettings"===e){let c=C.find(e=>e.id===t.conversationId);if(c){document.getElementById("group-settings-view").dataset.conversationId=c.id,document.getElementById("group-settings-name").textContent=c.name;let p=document.getElementById("group-settings-member-grid");if(p.innerHTML="",c.members.forEach(e=>{let t=document.createElement("div");t.className="group-member-item",t.dataset.memberId=e;let a="";e===c.owner?a=' <span class="member-role">(群主)</span>':c.admins&&c.admins.includes(e)&&(a=' <span class="member-role">(管理员)</span>'),t.innerHTML=`<img src="${ec(e)}"><span class="member-name-role">${ed(e,c.id)}${a}</span>`,p.appendChild(t)}),!c.userIsObserver){let u=document.createElement("div");u.className="add-member-btn",u.innerHTML="+",u.id="group-add-member-btn",p.appendChild(u)}let g=document.getElementById("group-dissolve-btn");c.dissolved?(g.innerHTML=`<span class="item-label" style="flex-grow: 1; text-align: center; color: var(--wechat-green-icon);">恢复群聊</span>`,g.dataset.action="recover"):c.userIsObserver?(g.innerHTML=`<span class="item-label danger" style="flex-grow: 1; text-align: center;">删除此聊天</span>`,g.dataset.action="delete"):(g.innerHTML=`<span class="item-label danger" style="flex-grow: 1; text-align: center;">解散群聊</span>`,g.dataset.action="dissolve")}}else if("weibo"===e)ay();else if("weiboFeed"===e){let y=document.getElementById("weibo-feed-title");t&&t.categoryName&&(y.textContent=t.categoryName)}else if("weiboDetail"===e);else if("diary"===e)eq();else if("diaryEntry"===e){let f="true"===localStorage.getItem("blmx_diary_icons_hidden");d.diaryEntry.classList.toggle("icons-hidden",f);let h=t.ownerId;if(!h){ep("diary");return}d.diaryEntry.dataset.ownerId=h,eP(h),document.getElementById("diary-entry-title").textContent=`${ed(h,null)}的日记`;let b=w.logEntries.map((e,t)=>({...e,originalIndex:t})).filter(e=>"DIARY_ENTRY"===e.key&&e.data.author===h);if(b.length>0){let v=b.sort((e,t)=>new Date(t.data.timestamp)-new Date(e.data.timestamp))[0];eE(v.originalIndex)}else eE(null)}else"forumProfile"===e?t.contactId?await eC(t.contactId):console.error("[Navigate] 尝试导航到个人主页，但未提供 contactId。"):"shoppingHome"===e&&B&&an(B)}async function eu(e){if(!e.type||!e.value)return;F(e.type,e.value);let t=Y.length-1,a="true"===localStorage.getItem(`blmx_nai_enabled_${k}`);if("description"!==e.type||!a||!q.id)return;let i=_.find(e=>e.id===q.id),n=i&&i.nai_appearance?i.nai_appearance:"";if(!n){console.log("[Call NAI] Skipped: No base appearance set.");return}try{console.log(`[Call NAI] Generating frame for: "${e.value}"`);let l=await t7(e.value),r=await t7(n),o=localStorage.getItem(`blmx_nai_positive_${k}`)||"",s=[o,r,l].filter(e=>e&&""!==e.trim()).join(", "),d=await tz(s);Y[t]&&(Y[t].image=d,z===t&&V())}catch(c){console.error("[Call NAI] Generation failed:",c)}}function eg(e){Object.values(d).forEach(e=>e.classList.remove("active"));let t=document.querySelectorAll(".call-view");e?t.forEach(t=>{t.id===e?t.classList.add("active"):t.classList.remove("active")}):(t.forEach(e=>e.classList.remove("active")),ep("wechatList"))}async function ey(){console.log("[Call] Ending current call session, preparing for summary...");let e=document.getElementById("chat-simulation-log"),t="";if(e&&e.children.length>0){let a=Array.from(e.querySelectorAll(".chat-simulation-message")).reverse().map(e=>{let t=e.classList.contains("me")?"{{user}}":q.name;return`${t}: ${e.textContent}`}).join("\n");await showDialog({mode:"alert",text:"通话已结束，AI正在为您总结通话内容..."}),b=!0,eX();try{let i=function e(t,a){let i=`
[任务：视频通话内容总结]

**你的角色**:
你是一名客观、细致的记录员。

**你的任务**:
阅读下方 {{user}} 与 ${ed(t,null)} 的视频通话记录，并生成一份详细、中立的摘要。

**【核心指令】**:
1.  **客观性**: 你的总结必须是基于通话内容的客观事实陈述。严禁添加任何主观评价、情感分析或角色扮演。
2.  **详细性**: 你的总结应尽可能捕捉对话中的关键信息点、做出的决定、重要的情绪转变以及未解决的问题。不要遗漏重要细节，字数100到200字左右。
3.  **严格的输出格式**: 你的回复必须严格遵守单一JSON对象的格式，不要包含任何其他文字或解释。

---
**通话记录**:
${a}
---

**输出格式:**
{"summary":"在此处填写你的详细、客观的通话内容总结..."}

**【输出示例】**:
{"summary":"用户询问了关于昨晚任务的细节，${ed(t,null)} 解释了其中存在的误会，并约定明天早上在办公室当面沟通。通话后半段，${ed(t,null)} 提到了自己最近遇到的一个难题，用户表示会帮忙留意。"}

现在，请开始你的总结任务。
`;return i.trim()}(q.id,a);N=i;let n=await v({user_input:i,should_stream:!1});M=n.trim();let l=JSON.parse(n.trim());l.summary&&(t=l.summary)}catch(r){console.error("[Call Summary] AI summary generation failed:",r),t="（AI未能成功总结通话内容）"}finally{b=!1,eX()}}(function e(t=""){if(!q.id)return;let a=C.find(e=>"single"===e.type&&e.members.includes(q.id));if(!a)return;let i=Math.floor(R/60).toString().padStart(2,"0"),n=(R%60).toString().padStart(2,"0"),l=`${i}:${n}`,r=`视频通话已结束，通话时长 ${l}`,o={convoId:a.id,timestamp:new Date(window.currentGameDate).toISOString().slice(0,16).replace("T"," "),description:r,...t&&{callSummary:t}};w.addEntry({type:"event_log",content:o}),w.persistLogToStorage(),T===a.id&&d.wechatChat.classList.contains("active")&&e8(o,w.logEntries.length-1),eS(a.id,o.timestamp)})(t),ev(),eg(null),P="idle",q={id:null,name:null,avatar:null}}async function ef(){if(console.log("[Call] User accepted the call. Connecting..."),b)return;P="in-call";let e=[...w.logEntries].reverse().find(e=>"VIDEO_CALL"===e.key&&e.data.caller===q.id);e&&(e.data.status="answered",w.persistLogToStorage());let t=document.getElementById("in-call-screen"),a=t.querySelector(".caller-name");a.textContent=q.name,t.style.backgroundImage=`url('${q.avatar}')`,Y=[],z=-1,F("image",q.avatar),eg("in-call-screen"),eb(),b=!0,eX(),"function"==typeof updateInCallButtonUI&&updateInCallButtonUI();try{let i=function e(t){let a=`
[SYSTEM NOTIFICATION: CALL ACCEPTED]

You are roleplaying as ${ed(t,null)} (ID: ${t}).
{{user}} has just answered your video call.

**Your Task:**
What is the very first thing you say or do? Your response can be a line of dialogue, an action to update the screen, or both.

**Output Formats:**
1.  **Dialogue:** Simply type what you want to say.
2.  **Screen Update:** Use \`UPDATE_CALL_SCREEN:{"type":"description", "value":"A description of what {{user}} sees on their screen."}\`

**Example:**
UPDATE_CALL_SCREEN:{"type":"description", "value":"他似乎刚从一堆文件里抬起头，脸上带着一丝疲惫，但看到你后还是露出了微笑。"}
喂？终于接了。

Now, please begin.
`;return a.trim()}(q.id);N=i;let n=await v({user_input:i,should_stream:!1});M=n.trim();let l=document.getElementById("chat-simulation-log");l.innerHTML="";let r=n.trim().split("\n");for(let o of r){if(!o)continue;let s=/UPDATE_CALL_SCREEN:({.*})/,d=o.match(s);if(d)try{eu(JSON.parse(d[1]))}catch(c){console.error("解析画面指令失败:",c)}else{let m=document.createElement("div");m.className="chat-simulation-message",m.textContent=o,l.insertBefore(m,l.firstChild)}}}catch(p){console.error("[Call Accept] AI failed to respond:",p);let u=document.getElementById("chat-simulation-log"),g=document.createElement("div");g.className="chat-simulation-message",g.style.color="#ff9999",g.textContent="(信号连接不稳定...)",u.insertBefore(g,u.firstChild)}finally{b=!1,eX(),"function"==typeof updateInCallButtonUI&&updateInCallButtonUI()}}function eh(){console.log("[Call] User declined the call.");let e=[...w.logEntries].reverse().find(e=>"VIDEO_CALL"===e.key&&e.data.caller===q.id);e&&(e.data.status="declined",w.persistLogToStorage());let t=C.find(e=>"single"===e.type&&e.members.includes(q.id));if(t){let a={convoId:t.id,timestamp:new Date(window.currentGameDate).toISOString().slice(0,16).replace("T"," "),description:`你拒接了 ${q.name} 的视频通话邀请。`};w.addEntry({type:"event_log",content:a}),w.persistLogToStorage(),eS(t.id,a.timestamp)}P="idle",eg(null)}function eb(){ev();let e=document.getElementById("call-timer");e&&(R=0,e.textContent="00:00",H=setInterval(()=>{R++;let t=Math.floor(R/60).toString().padStart(2,"0"),a=(R%60).toString().padStart(2,"0");e.textContent=`${t}:${a}`},1e3))}function ev(){clearInterval(H),H=null}function ew(e){let t=_.find(t=>t.id===e);if(!t)return;document.getElementById("contact-details-profile-card").dataset.contactId=t.id,document.getElementById("contact-details-avatar").src=ec(t.id),document.getElementById("contact-details-name").textContent=ed(t.id,null),document.getElementById("contact-details-avatar").dataset.contactId=t.id;let a=document.getElementById("set-private-chat-wallpaper-btn"),i=C.find(e=>"single"===e.type&&e.members.includes(t.id));i?(a.style.display="flex",a.dataset.convoId=i.id):a.style.display="none";let n=document.querySelector("#block-contact-btn .item-label");n&&(n.textContent=t.isBlocked?"解除拉黑":"加入黑名单")}function eE(e){let t=document.getElementById("diary-entry-view"),a=document.getElementById("diary-entry-title-h1"),i=document.getElementById("diary-entry-content-div"),n=document.getElementById("diary-entry-meta-p"),l=document.getElementById("diary-header-avatar");if(a.textContent="",i.innerHTML="",n.innerHTML="",l.style.display="none",null===e){a.textContent="空空如也",i.innerHTML="<p>这里还没有任何日记。点击右上角的“+”号来写下第一篇吧！</p>",t.dataset.viewingIndex="-1";let r=t.dataset.ownerId;r&&(l.src=ec(r),l.style.display="block"),eI();return}if(w&&"number"==typeof e&&w.logEntries[e]){let o=w.logEntries[e];if("DIARY_ENTRY"===o.key){let s=o.data;if(a.textContent=s.title||"无标题日记",n.innerHTML=`
                <span id="diary-meta-author">作者: ${ed(s.author,null)}</span>
                <span id="diary-meta-date">${s.timestamp?function e(t){if(!t)return"";let a=new Date(t.replace(" ","T"));if(isNaN(a))return"";let i=a.getFullYear(),n=(a.getMonth()+1).toString().padStart(2,"0"),l=a.getDate().toString().padStart(2,"0");return`${i}年${n}月${l}日`}(s.timestamp):""}</span>
                <span id="diary-meta-weather">${s.weather?`天气: ${s.weather}`:""}</span>
            `,l.src=ec(s.author),l.style.display="block",s.content){let d=s.content.trim().split("\n"),c=d.map(e=>`<p>${e.trim()||"&nbsp;"}</p>`).join("");i.innerHTML=c}t.dataset.viewingIndex=String(e)}else a.textContent="渲染错误",i.innerHTML="<p>无法加载日记，因为该条目不是有效的日记记录。</p>",t.dataset.viewingIndex="-1"}else a.textContent="查找错误",i.innerHTML="<p>无法在日志中找到对应的日记记录。</p>",t.dataset.viewingIndex="-1";eI()}function eI(){let e=document.getElementById("diary-entry-view"),t=e.dataset.ownerId,a=parseInt(e.dataset.viewingIndex,10),i=document.getElementById("diary-prev-btn"),n=document.getElementById("diary-next-btn"),l=document.getElementById("diary-delete-entry-btn");if(!t||isNaN(a)||a<0){i.classList.add("disabled"),n.classList.add("disabled"),l.classList.add("disabled");return}let r=w.logEntries.map((e,t)=>({...e,originalIndex:t})).filter(e=>"DIARY_ENTRY"===e.key&&e.data.author===t).sort((e,t)=>new Date(t.data.timestamp)-new Date(e.data.timestamp)),o=r.findIndex(e=>e.originalIndex===a);0===o?i.classList.add("disabled"):i.classList.remove("disabled"),o===r.length-1?n.classList.add("disabled"):n.classList.remove("disabled"),l.classList.remove("disabled")}function ex(e,t,a={duration:600,preventDefault:!0}){let i,n,l,r=e=>{("mousedown"!==e.type||0===e.button)&&(n="touchstart"===e.type?e.touches[0].clientX:e.clientX,l="touchstart"===e.type?e.touches[0].clientY:e.clientY,a.preventDefault&&e.preventDefault(),clearTimeout(i),i=setTimeout(()=>{i=null,t(e)},a.duration))},o=e=>{if(!i)return;let t="touchmove"===e.type?e.touches[0].clientX:e.clientX,a="touchmove"===e.type?e.touches[0].clientY:e.clientY;(Math.abs(t-n)>10||Math.abs(a-l)>10)&&clearTimeout(i)},s=()=>clearTimeout(i);e.addEventListener("pointerdown",r),e.addEventListener("pointermove",o),e.addEventListener("pointerup",s),e.addEventListener("pointerleave",s),a.preventDefault&&e.addEventListener("contextmenu",e=>e.preventDefault())}function e9(e,t,a){let i=ed(e.data.author,e.conversationId),n=document.createElement("div");n.className="timestamp-row",void 0!==a&&(n.dataset.logIndex=a);let l=e.data.target_text||"(内容未知)";n.innerHTML=`
            <div class="recall-notice-container">
                <div class="recall-notice-text">"${i}" 撤回了一条消息</div>
                <div class="recall-content">${l}</div>
            </div>
        `;let r=n.querySelector(".recall-notice-text"),o=n.querySelector(".recall-content");r.addEventListener("click",()=>{o.classList.toggle("expanded")}),t?t.replaceWith(n):c.appendChild(n)}function e$(e){if(c.innerHTML="",!w)return;let t=w.logEntries.map((e,t)=>({...e,originalIndex:t})).filter(t=>{let a=t.convoId||t.conversationId||t.content&&t.content.convoId||t.data&&t.data.convoId;return a===e}),a=E.filter(t=>t.conversationId===e).map((e,t)=>({...e,originalIndex:w.logEntries.length+t,timestamp:new Date().toISOString()})),i=[...t,...a];i.sort((e,t)=>{if(void 0!==e.originalIndex&&void 0!==t.originalIndex)return e.originalIndex-t.originalIndex;let a=e=>e.timestamp?new Date(e.timestamp):e.data&&e.data.timestamp?new Date(e.data.timestamp):e.content&&e.content.timestamp?new Date(e.content.timestamp):null,i=a(e),n=a(t);return i&&n?i-n:0}),i.forEach(e=>{"RECALL_MESSAGE"!==e.key&&function e(t,a){if("RECALL_MESSAGE"===t.key){let i=t.data.target_text,n=t.data.author,r=Array.from(c.querySelectorAll(".message-row")).reverse(),o=r.find(e=>{let t=e.querySelector(".message-bubble");if(!t)return!1;let a=e.querySelector(".message-avatar").dataset.senderId;return a===n&&t.textContent.trim()===i});o&&e9(t,o,a);return}switch(t.type){case"event_log":e8(t.content,a);break;case"group_event":ek(t.content,a);break;case"time":break;case void 0:t.key||console.warn("Undefined entry type, skipping UI add:",t);break;default:(function e(t,a){let{id:i,sender:n,type:r,data:o}=t,s="user"===n||"{{user}}"===n||n===A.name?"me":"them",d=t.convoId||t.conversationId,m=C.find(e=>e.id===d),p=document.createElement("div");p.className="message-row "+s,void 0!==a&&(p.dataset.logIndex=a),p.dataset.messageId=i;let u=m&&"vgroup"===m.type&&!m.members.includes(n),g="me"===s?"user":n,y;if(u){if(U.has(n))y=U.get(n);else{let f=new Set(U.values()),h=X.filter(e=>!f.has(e)),b=h.length>0?h[Math.floor(Math.random()*h.length)]:X[Math.floor(Math.random()*X.length)];U.set(n,b),y=b}}else y=ec(g);let v=`<img src="${y}" class="message-avatar" data-sender-id="${g}">`,x=document.createElement("div");if(x.className="message-content-wrapper",m&&("group"===m.type||"vgroup"===m.type)&&"them"===s){let $=document.createElement("div");$.className="sender-name-label",$.textContent=u?n:ed(n,d),x.appendChild($)}let L="",B="message-bubble";switch(t.isFailed&&(B+=" failed-message-bubble"),r){case"sticker":let D=function e(t){let a=[];a.push(...ea,...JSON.parse(localStorage.getItem(et)||"[]")),_.forEach(e=>{let t=JSON.parse(localStorage.getItem(ei(e.id))||"[]");a.push(...t)}),C.forEach(e=>{if("group"===e.type){let t=JSON.parse(localStorage.getItem(ei(e.id))||"[]");a.push(...t)}else if("single"===e.type){let i=e.members.find(e=>"user"!==e);if(i){let n=JSON.parse(localStorage.getItem(ei(i))||"[]");a.push(...n)}}});let i=a.filter((e,t,a)=>e.label&&t===a.findIndex(t=>t.label===e.label)),n=i.find(e=>e.label===t);return n?n.url:void 0}(t.content);D?(L=`<img src="${D}" alt="${t.content}">`,B+=" sticker-bubble"):L=`[表情: ${t.content}]`;break;case"forward":{let M=t.data,N=M.messageIds||[],P=M.title,H=!1,R=!1;if(N&&N.length>0){let q=N[0];if("string"==typeof q&&q.startsWith("moment_"))H=!0,P||(P="转发的动态");else try{let G=JSON.parse(q);G&&"weibo_post"===G.type&&(R=!0,P||(P="转发的帖子"))}catch(W){}}P||(P="转发的聊天记录");let j="",Y=null;if(N&&N.length>0){let z=N[0];if(H){let F=w.logEntries.find(e=>"MOMENT"===e.key&&e.data.momentId===z);if(F){let V=F.data,K=ed(V.author,null),J=V.text||"[图片动态]";j=`<p style="display: flex; align-items: center; gap: 5px;"><i class="far fa-images" style="color: #4CAF50;"></i><strong>@${K}</strong></p><p>${J.substring(0,30)}</p>`}else j=`<p style="display: flex; align-items: center; gap: 5px;"><i class="far fa-images" style="color: #4CAF50;"></i><strong>@匿名用户</strong></p><p>点击查看内容</p>`}else if(R)try{let Z=JSON.parse(z);Y=Z.postId,j=`<p style="display: flex; align-items: center; gap: 5px;"><i class="fab fa-weibo" style="color: #E14438;"></i><strong>@${Z.author}</strong></p><p>${Z.title||Z.summary}</p>`}catch(Q){}else{let ee=M.messageIds.map(e=>w.logEntries.find(t=>t.id===e)).filter(Boolean);ee.length>0?ee.slice(0,2).forEach(e=>{let t=`[${e.type||"复合消息"}]`;e.content&&("string"==typeof e.content?t=e.content:e.content.text&&(t=e.content.text)),j+=`<p>${ed(e.senderId||e.sender,null)}: ${t.substring(0,20)}</p>`}):j=`<p>[聊天记录] 点击查看详情</p>`}}let en=Y?`data-post-id="${Y}"`:"";L=`<div class="forward-card" data-forward-id="${i}" data-message-ids='${JSON.stringify(M.messageIds)}' ${en} data-title="${P.replace(/"/g,"&quot;")}">
        <div class="forward-title">${P}</div>
        <div class="forward-summary">${j}</div>
    </div>`,B+=" forward-bubble";break}case"image":if(t.content&&"url"===t.content.type){let el=t.content.value;if(el.startsWith("blmx-img-")){let er=sessionStorage.getItem(el);el=er||"https://files.catbox.moe/bialj8.jpeg"}L=`<img src="${el}" alt="图片">`,B+=" image-url-bubble"}else{let eo=t.content&&t.content.value?t.content.value:t.content,es=l(t.id,eo);es?(L=es,es.includes("<img")?B+=" sticker-bubble":B+=" image-desc-bubble"):(L=`<div class="image-desc-content">${String(eo).replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`,B+=" image-desc-bubble")}break;case"location":L=`<div class="location-card"><div class="location-content"><div class="location-title">${t.content}</div><div class="location-subtitle">共享实时位置</div></div><div class="location-map-placeholder"></div></div>`,B+=" location-bubble";break;case"transfer":{let em="string"==typeof o?JSON.parse(o):o,eu="sent"!==em.status,eg="";m&&"group"===m.type&&em.recipientId&&(eg=`<div class="recipient-note">转账给：${ed(em.recipientId,d)}</div>`);let ey=eu?`<div class="status-text">${"accepted"===em.status?"已接收":"已退还"}</div>`:`${eg}<div class="note">${em.note||" "}</div>`;L=`<div class="transfer-card ${eu?"transfer-receipt":"transfer-initial"}"><div class="transfer-content"><img src="https://files.catbox.moe/y8059q.png" class="transfer-icon-image"><div class="transfer-details"><div class="amount">\xa5${em.amount}</div>${ey}</div></div><div class="transfer-footer">转账</div></div>`,B+=" transfer-bubble";break}case"file":L=`<div class="file-card"><div class="file-content"><i class="fas fa-file-alt file-icon"></i><div class="file-details"><div class="file-name">${t.content.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div></div></div><div class="file-footer">文件</div></div>`,B+=" file-bubble";break;case"gift":{let ef="string"==typeof o?JSON.parse(o):o,eh="";m&&"group"===m.type&&ef.recipientId&&(eh=`<div class="recipient-note">送给：${ed(ef.recipientId,d)}</div>`);let eb="";L=`<div class="gift-content"><i class="fas fa-gift gift-icon"></i><div class="gift-details"><div class="gift-name">${ef.name}</div>${eb="sent"===ef.status?`${eh}`+(ef.price?`<div class="gift-price">\xa5 ${ef.price}</div>`:""):`<div class="gift-status-text">${"accepted"===ef.status?"已收下":"已拒收"}</div>`}</div></div><div class="gift-footer">礼物</div>`,B+=" gift-bubble","sent"!==ef.status&&(B+=" gift-receipt");break}case"music_share":{let ev=t.data||{},ew=ev.cover;ew&&"https://files.catbox.moe/g3x1v8.jpg"!==ew||(ew=ec(t.sender)),L=`
							<div class="music-share-card" data-song-info='${JSON.stringify(ev)}'>
								<div class="music-share-cover" style="background-image: url('${ew}');"></div>
								<div class="music-share-info">
									<div class="music-share-title">${ev.title||"未知歌曲"}</div>
									<div class="music-share-artist">${ev.artist||"未知歌手"}</div>
								</div>
							</div>
							<div class="music-share-footer">
								<i class="fas fa-music"></i> 一起听
							</div>
						`,B+=" music-share-bubble";break}case"payment_receipt":let eE={};try{"object"==typeof t.content&&null!==t.content?eE=t.content:"string"==typeof t.content&&(eE=JSON.parse(t.content))}catch(eI){console.error("代付数据解析失败",eI),eE={total:"0.00",payer:"未知",receiver:"未知"}}let e9="",e8=eE.items||[];e8.slice(0,3).forEach(e=>{e9+=`
            <div class="receipt-row">
                <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:10px;">${e.title}</span>
                <span>\xa5${e.price}</span>
            </div>`}),e8.length>3&&(e9+=`<div class="receipt-row" style="color:#bbb; font-size:0.8em;">... 等共 ${e8.length} 件商品</div>`);let eL=eE.timestamp?eE.timestamp:eT(t.timestamp);L=`
        <div class="payment-receipt-card">
            <div class="receipt-header">
                <i class="fas fa-check-circle"></i> 代付成功通知
            </div>
            <div class="receipt-body">
                <div class="receipt-label">支付金额</div>
                <div class="receipt-amount">\xa5${eE.total||"0.00"}</div>
                <div class="receipt-divider"></div>
                <div class="receipt-row highlight">
                    <span>付款人</span>
                    <span>${eE.payer||"未知"}</span>
                </div>
                <div class="receipt-row">
                    <span>接收人</span>
                    <span>${ed(eE.receiver||"user",null)}</span>
                </div>
                <div class="receipt-divider"></div>
                <div style="margin-bottom:0.5rem; font-size:0.85em; color:#999;">商品明细：</div>
                ${e9}
            </div>
            <div class="receipt-footer">
                <span>支付时间：${eL}</span>
                <i class="fas fa-chevron-right"></i>
            </div>
        </div>
    `,B="message-bubble shopping-receipt-bubble";break;case"product_share":let ek=t.content,eS=ek.image;!eS||eS.startsWith("http")||eS.startsWith("blob:")||(eS="https://files.catbox.moe/c41va3.jpg"),L=`
                    <div class="product-share-card" data-product='${JSON.stringify(ek)}'>
                        <div class="ps-content">
                            <img src="${eS}" class="ps-img">
                            <div class="ps-info">
                                <div class="ps-title">${ek.title||"未知商品"}</div>
                                <div class="ps-price">\xa5${ek.price||"0.00"}</div>
                            </div>
                        </div>
                        <div class="ps-footer">
                            <i class="fab fa-taobao" style="color: #FF5000;"></i> 淘宝商品
                        </div>
                    </div>
                `,B+=" product-share-bubble";break;case"red_packet":{let eD=t.content,e_=eD.note||"恭喜发财，大吉大利";L=`
<div class="red-packet-card">
	<div class="red-packet-content">
		<i class="fas fa-wallet red-packet-icon"></i>
		<div class="red-packet-details">
			<div class="red-packet-title">${e_}</div>
		</div>
	</div>
	<div class="red-packet-footer">微信红包</div>
</div>`,B+=" red-packet-bubble";break}case"voice":L=`
						<div class="voice-controls">
							<span class="duration">${t.content.duration}"</span>
							<div class="voice-waveform">
								<span></span><span></span><span></span><span></span>
							</div>
						</div>
						<div class="voice-text-content">${t.content.text.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
					`,B+=" voice-bubble";break;default:let eC=t.content.match(/^\[引用:\s*"(.*?):\s*(.*?)"\]\s*(.*)$/s);if(eC){let eM=eC[1],eN=eC[2],eO=eC[3],e0=eN.match(/^\[语音:\s*(.*)\]$/);if(e0)try{let eP=e0[1].replace(/\\"/g,'"'),eH=JSON.parse(eP);eN=`语音：${eH.text}`}catch(eR){console.error("解析引用的语音消息失败:",eR,"原始字符串:",e0[1]),eN="[语音]"}else eN.startsWith("[表情:")?eN="[表情]":eN.startsWith("[图片:")?eN="[图片]":eN.startsWith("[位置:")&&(eN="[位置]");L=`
								<div class="quote-container">
									<div class="quote-author">${eM}</div>
									<div class="quote-content">${eN.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
								</div>
								<span class="reply-text">${eO.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</span>
							`}else L=t.content.replace(/</g,"&lt;").replace(/>/g,"&gt;")}let eq=document.createElement("div");eq.className=B,eq.innerHTML=L,x.appendChild(eq);let e3=document.createElement("input");e3.type="checkbox",e3.className="forward-checkbox",e3.dataset.messageId=i;let eU=null;if(t.isFailed&&((eU=document.createElement("i")).className="fas fa-exclamation-circle failed-status-icon"),"me"===s?(p.appendChild(e3),eU&&p.appendChild(eU),p.appendChild(x),p.insertAdjacentHTML("beforeend",v)):(p.appendChild(e3),p.insertAdjacentHTML("beforeend",v),p.appendChild(x),eU&&p.appendChild(eU)),"voice"===r&&eq.addEventListener("click",()=>{let e=eq.querySelector(".voice-text-content");e&&e.classList.toggle("expanded")}),"forward"===r){let eG=eq.querySelector(".forward-card");eG.addEventListener("click",()=>{let e=eG.dataset.postId;if(e){let t=O.posts.find(t=>t.postId===e);t?(ep("weiboDetail",{postId:e,category:t.category}),eA(e)):showDialog({mode:"alert",text:"该微博已被作者删除或链接已失效。"})}else{let a=eG.dataset.messageIds,i=JSON.parse(a),n=!1;try{let l=JSON.parse(i[0]);l&&"weibo_post"===l.type&&(n=!0)}catch(r){}if(n)showDialog({mode:"alert",text:"这是一个微博转发预览，但由于格式原因无法直接跳转。"});else if(i[0].startsWith("moment_")){let o=eG.dataset.title||"转发的动态";(function e(t,a){let i=document.getElementById("forward-content-modal"),n=document.getElementById("forward-content-modal-body"),l=i.querySelector(".title"),r=parseInt(t.replace("moment_",""),10),o=w.logEntries[r];if(l.textContent="查看动态",n.innerHTML="",!o||"MOMENT"!==o.key){n.innerHTML=`
<li class="moment-post" style="border:none;">
	<img src="https://files.catbox.moe/bialj8.jpeg" class="post-author-avatar" style="background:#ddd;">
	<div class="post-details">
		<div class="post-header">
			<span class="post-author-name" style="color:#576b95;">匿名用户</span>
		</div>
		<!-- 这里直接显示转发卡片上的标题 -->
		<p class="post-content" style="margin-top:0.5rem;">${a||"内容加载失败"}</p>
		<div class="post-meta" style="margin-top:0.5rem; font-size:0.8em; color:#999;">
			<span>刚刚</span>
		</div>
	</div>
</li>
`,i.style.display="flex";return}eB(null);let s=document.getElementById("moments-feed-list").querySelector(`.moment-post[data-moment-id="${o.data.momentId}"]`);if(s){let d=s.cloneNode(!0),c=d.querySelector(".post-actions-top");c&&(c.style.display="none");let m=d.querySelector(".moment-reply-btn");m&&(m.style.display="none"),n.appendChild(d),i.style.display="flex"}eB(S)})(i[0],o)}else{let s=w.logEntries.find(e=>e.id===eG.dataset.forwardId);s&&function e(t){let a=document.getElementById("forward-content-modal"),i=document.getElementById("forward-content-modal-body"),n=a.querySelector(".title");n.textContent=t.title,i.innerHTML="";let l=t.messageIds.map(e=>w.logEntries.find(t=>t.id===e)).filter(Boolean);l.forEach(e=>{let t=document.createElement("div");t.className="forward-modal-item";let a="object"==typeof e.content&&"voice"!==e.type?`[${e.type||"复合消息"}]`:e.content.text||e.content,n=e.recalled_timestamp||e.data&&e.data.timestamp||e.content&&e.content.timestamp?eT(e.recalled_timestamp||e.data.timestamp||e.content.timestamp):"";t.innerHTML=`
                            <div class="forward-modal-item-header">
                                <img src="${ec(e.sender)}" alt="">
                                <span class="name">${ed(e.sender,e.conversationId)}</span>
                                <span style="margin-left:auto; font-size: 0.8em; color: #999;">${n}</span>
                            </div>
                            <div class="forward-modal-item-content">${a}</div>
                        `,i.appendChild(t)}),a.style.display="flex"}(s.data)}}})}if("transfer"===r&&"them"===s&&"sent"===o.status){let eW=eq.querySelector(".transfer-card");eW.classList.add("them"),eW.addEventListener("click",async()=>{let e=await showDialog({mode:"confirm",text:`是否要接收来自 ${ed(n,d)} 的转账？`}),t={amount:o.amount,status:e?"accepted":"rejected"};e1({type:"transfer",sender:"me",content:JSON.stringify(t),data:t})},{once:!0})}if("gift"===r&&"them"===s&&"sent"===o.status&&(eq.style.cursor="pointer",eq.addEventListener("click",async()=>{let e=await showDialog({mode:"confirm",text:`是否要接收来自 ${ed(n,d)} 的礼物 "${o.name}"？`}),t={name:o.name,status:e?"accepted":"rejected"};e1({type:"gift",sender:"me",content:JSON.stringify(t),data:t}),I=!0,eX(),eq.style.cursor="default"},{once:!0})),"red_packet"===r&&"them"===s&&eq.querySelector(".red-packet-card").addEventListener("click",async()=>{await showDialog({mode:"alert",text:`你领取了 ${ed(n,d)} 的红包。`})},{once:!0}),"me"===s&&"message"===r&&ex(eq,async()=>{let e=w.logEntries.find(e=>e.id===i)||E.find(e=>e.id===i);if(!e)return;let t=new Date(window.currentGameDate).toISOString().slice(0,16),a=await tl("输入撤回时间 (格式 YYYY-MM-DDTHH:mm)",t);if(a){let n=await showDialog({mode:"confirm",text:"是否要撤回这条消息？"});if(n){let l={author:"user",target_text:e.content,timestamp:a};w.addEntry({key:"RECALL_MESSAGE",data:l});let r=E.findIndex(e=>e.id===i);r>-1&&E.splice(r,1),w.persistLogToStorage(),e$(T)}}}),"music_share"===r&&(eq.style.cursor="pointer",eq.addEventListener("click",async()=>{let e=t.data||("object"==typeof t.content?t.content:JSON.parse(t.content));if("me"===s){if(ep("listenTogether"),currentSong={title:e.title||"未知歌曲",artist:e.artist||"未知歌手",src:e.src||"",lrc:e.lrc||""},localStorage.setItem(`blmx_current_song_${k}`,JSON.stringify(currentSong)),document.getElementById("lt-song-title").textContent=currentSong.title,document.getElementById("lt-artist-name").textContent=currentSong.artist,currentSong.src){globalAudio.pause(),globalAudio.src=currentSong.src,tA(currentSong.lrc),tM();try{await globalAudio.play(),document.getElementById("lt-play-pause-btn").className="fas fa-pause-circle",document.getElementById("lt-vinyl-container").classList.add("playing"),document.getElementById("lt-vinyl-view").classList.add("playing")}catch(a){console.error(a)}}}else ep("listenTogether"),setTimeout(async()=>{await showDialog({mode:"alert",text:`TA邀请你一起听：
《${e.title}》

AI无法提供真实音源，请在接下来的弹窗中补充 MP3 链接。`});let t=await af({title:"完善歌曲信息",fields:[{id:"title",label:"歌名",type:"text",defaultValue:e.title},{id:"artist",label:"歌手",type:"text",defaultValue:e.artist},{id:"src",label:"MP3 直链 URL",type:"text",defaultValue:""},{id:"lrc",label:"LRC 歌词文本",type:"textarea",defaultValue:""}]});if(t&&t.src.trim()){currentSong={title:t.title.trim(),artist:t.artist.trim(),src:t.src.trim(),lrc:t.lrc||""},localStorage.setItem(`blmx_current_song_${k}`,JSON.stringify(currentSong)),document.getElementById("lt-song-title").textContent=currentSong.title,document.getElementById("lt-artist-name").textContent=currentSong.artist,globalAudio.pause(),globalAudio.src=currentSong.src,tA(currentSong.lrc),tM(),await showDialog({mode:"alert",text:"歌曲已加载，开始播放！"});try{await globalAudio.play(),document.getElementById("lt-play-pause-btn").className="fas fa-pause-circle",document.getElementById("lt-vinyl-container").classList.add("playing"),document.getElementById("lt-vinyl-view").classList.add("playing")}catch(a){}}},300)})),"product_share"===r){let ej=eq.querySelector(".product-share-card");ej.addEventListener("click",()=>{let e=JSON.parse(ej.dataset.product);ep("productDetail"),ar(e)})}c.appendChild(p),c.scrollTop=c.scrollHeight})(t,a)}}(e,e.originalIndex)});let n=w.logEntries.filter(e=>"RECALL_MESSAGE"===e.key);n.forEach(e=>{let t=e.data.target_text,a=e.data.author,i=Array.from(c.querySelectorAll(".message-row")),n=i.find(e=>{let i=e.querySelector(".message-bubble");if(!i)return!1;let n=e.querySelector(".message-avatar").dataset.senderId;return n===a&&i.textContent.trim()===t});n&&e9(e,n,e.originalIndex)}),c.scrollTop=c.scrollHeight}function e8(e,t){let a=eT(e.timestamp),i=document.createElement("div");i.className="event-log-row",void 0!==t&&(i.dataset.logIndex=t);let n=e.callSummary&&""!==e.callSummary.trim(),l=`
        <div class="event-log-container">
            <div class="event-time-text">${a}</div>
    `;n?l+=`<div class="event-description">${e.callSummary.replace(/\n/g,"<br>")}</div>`:e.description&&(l+=`<div class="event-description">${e.description}</div>`),l+="</div>",i.innerHTML=l;let r=n||e.description&&""!==e.description.trim();if(r){let o=i.querySelector(".event-time-text"),s=i.querySelector(".event-description");n?o.textContent=e.description+" (点击查看摘要)":o.textContent=a,o.classList.add("has-desc"),o.addEventListener("click",()=>{s.classList.toggle("expanded")})}c.appendChild(i)}function eL(e){let t="",a=ed(e.author,e.convoId);switch(e.type){case"create":t=`"${a}"创建了群聊`;break;case"add":let i=e.targetIds.map(t=>`"${ed(t,e.convoId)}"`).join("、");t=`"${a}"邀请了${i}加入了群聊`;break;case"remove":case"kick":t=`"${ed(e.targetId,e.convoId)}"已被"${a}"移出群聊`;break;case"leave":t=`"${a}"退出了群聊`;break;case"rename":case"rename_group":t=`"${a}"修改群名为“${e.newName}”`;break;case"mute":t=`"${ed(e.targetId,e.convoId)}"被"${a}"禁言${e.duration}分钟`;break;case"unmute":t=`"${ed(e.targetId,e.convoId)}"已被"${a}"解除禁言`;break;case"unmute_auto":t=`"${ed(e.targetId,e.convoId)}"的禁言已到期，自动解除`;break;case"set_admin":t=`"${a}"已将"${ed(e.targetId,e.convoId)}"设为管理员`;break;case"unset_admin":t=`"${ed(e.targetId,e.convoId)}"的管理员已被"${a}"取消`;break;case"nickname_change":let n=e.oldName||ed(e.targetId,e.convoId),l=ed(e.author,e.convoId);t=e.targetId===e.author?`"${l}"将自己的群昵称修改为“${e.newName}”`:`"${l}"将群内“${n}”的昵称修改为“${e.newName}”`;break;case"dissolve":t=`群聊已被"${a}"解散`;break;case"red_packet_grab":t=`${e.grabberName}领取了${a}的红包`,e.amount&&(t+=`，抢了${e.amount.toFixed(2)}元`),e.isLuckiest&&(t+=`，是运气王`)}return t}function ek(e,t){let a=eL(e);if(!a)return;let i=document.createElement("div");i.className="system-event-row",void 0!==t&&(i.dataset.logIndex=t),i.innerHTML=`<span class="system-event-text">${a}</span>`,c.appendChild(i)}function eT(e){if(!e)return" ";let t=e.replace(" ","T"),a=new Date(t);if(isNaN(a))return" ";let i=new Date(window.currentGameDate),n=new Date(i.getFullYear(),i.getMonth(),i.getDate()),l=new Date(n);l.setDate(n.getDate()-1);let r=a.getHours().toString().padStart(2,"0"),o=a.getMinutes().toString().padStart(2,"0"),s=`${r}:${o}`;return a>=n?s:a>=l?`昨天 ${s}`:a.getFullYear()===i.getFullYear()?`${a.getMonth()+1}月${a.getDate()}日`:`${a.getFullYear()}年${a.getMonth()+1}月${a.getDate()}日`}function eS(e,t){let a=C.find(t=>t.id===e);if(!a||!t)return;let i=new Date(t.replace(" ","T")).getTime();!isNaN(i)&&i>(a.lastActivity||0)&&(a.lastActivity=i,console.log(`[Time Sync] Conversation ${e} updated to ${new Date(i).toLocaleString()}`))}function eB(e){if(!w)return;let t=!e,a="user"===e,i=a?A:_.find(t=>t.id===e),n=t?A:i;if(!n){console.error("Cannot render moments for unknown author:",e);return}document.getElementById("moments-cover-photo").src=n.cover||"https://files.catbox.moe/bialj8.jpeg",document.getElementById("moments-user-avatar").src=ec(n.id),document.getElementById("moments-user-name").textContent=ed(n.id,null),document.getElementById("user-signature-display").textContent=n.signature||"",document.getElementById("post-moment-btn").style.display=t||a?"block":"none";let r=document.getElementById("moments-cover-photo");r.onclick=async()=>{let e=t?A:i,a=await showDialog({mode:"prompt",text:`为 ${ed(e.id,null)} 输入新的朋友圈封面URL:`,defaultValue:e.cover||""});null!==a&&(e.cover=a,r.src=a,el())},h.innerHTML="";let o=w.logEntries.filter(e=>"MOMENT"===e.key&&e.data&&e.data.momentId),s={};o.forEach(t=>{e&&t.data.author!==e||(s[t.data.momentId]={...t,likes:[],comments:[]})}),w.logEntries.forEach(e=>{if("CHAR_LIKE"===e.key||"CHAR_COMMENT"===e.key){let t=e.data.target_post_id;if(t&&s[t]){if("CHAR_LIKE"===e.key){let a=ed(e.data.author,null);s[t].likes.some(e=>e.name===a)||s[t].likes.push({name:a,authorId:e.data.author})}else s[t].comments.push({...e})}}}),Object.values(s).reverse().forEach(e=>{let{data:t}=e,a=t.author,i=ed(a,null),n=ec(a),r=!0;t.invisibleTo&&(t.invisibleTo.includes("user")||t.invisibleTo.includes("{{user}}"))?r=!1:t.visibleTo&&t.visibleTo.length>0&&!(t.visibleTo.includes("user")||t.visibleTo.includes("{{user}}"))&&(r=!1),t.visibleTo&&t.visibleTo.includes("user")&&(r=!0);let o=document.createElement("li");o.className="moment-post",o.dataset.momentId=t.momentId,o.dataset.authorId=a;let s="";if("url"===t.image_type&&t.image)s=`<div class="post-media-container"><img src="${t.image}" class="post-media-image"></div>`;else if("desc"===t.image_type&&t.image){let d=l(t.momentId,t.image);s=d?`<div class="post-media-container">${d}</div>`:`<div class="post-media-container"><div class="image-desc-content">${t.image}</div></div>`}let c="";if(e.comments.length>0){let m='<ul class="comments-section">'+e.comments.map(e=>{let t=ed(e.data.author,null),a=e.data.text,i=a.match(/^\[引用:"(.*?):\s*(.*?)"\]\s*(.*)$/s),n=a.match(/^@([^:]+):\s*(.*)$/s);if(i){let l=i[1],r=i[2],o=i[3];return'<li><span class="comment-author">'+t+'</span>: <div class="moment-quote-block"><div class="quote-author">@'+l+'</div><div class="quote-content">'+r.replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</div></div><span class="reply-text">'+o.replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</span></li>"}if(!n)return'<li><span class="comment-author">'+t+"</span>: "+a.replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</li>";{let s=n[1],d=n[2];return'<li><span class="comment-author">'+t+'</span> 回复 <span class="comment-author">'+s.replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</span>: <span class="reply-text">'+d.replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</span></li>"}}).join("")+"</ul>";c=`<div class="post-interactions">${m}</div>`}let p="";if(r){if(t.isPrivate)p=`<span class="privacy-indicator" title="私密，仅自己可见"><i class="fas fa-lock"></i></span>`;else if(t.visibleTo&&t.visibleTo.length>0||t.invisibleTo&&t.invisibleTo.length>0){let u=t.visibleTo&&t.visibleTo.length>0?`部分可见: ${t.visibleTo.map(e=>ed(e,null)).join(", ")}`:"",g=t.invisibleTo&&t.invisibleTo.length>0?`不给谁看: ${t.invisibleTo.map(e=>ed(e,null)).join(", ")}`:"";p=`<span class="privacy-indicator" title="${u}
${g}"><i class="fas fa-user-friends"></i></span>`}}else p=`<span class="privacy-indicator" title="对你不可见"><i class="fas fa-eye-slash"></i></span>`;let y=eT(t.timestamp),f=`<i class="fas fa-trash-alt delete-moment-btn" title="删除"></i>`,b=e.likes.some(e=>"user"===e.authorId||"{{user}}"===e.authorId),v=`post-author-name ${"user"===a||"{{user}}"===a?"":"is-character"}`,w=r?"":"disabled";o.innerHTML=`
			<img src="${n}" alt="Avatar" class="post-author-avatar">
			<div class="post-details">
				<div class="post-header">
					<span class="${v}">${i}</span>
					<div class="post-actions-top ${w}">
						<i class="fas fa-share-alt" title="转发" data-action="forward"></i>
						<i class="${b?"fas fa-heart liked":"far fa-heart"}" title="点赞" data-action="like"></i>
					</div>
				</div>
				<p class="post-content">${t.text||""}</p>
				<div class="post-media">${s}</div>
				<div class="post-meta">
					<span class="timestamp">${y}</span>
					<div class="post-meta-right">
						${p}
						${f}
						<button class="moment-reply-btn ${w}" data-action="reply">回复</button>
					</div>
				</div>
				${c}
			</div>
		`,h.appendChild(o)})}function eD(e){let t=document.getElementById("weibo-feed-list-container"),a=document.getElementById("weibo-feed-title");t.innerHTML="";let i=au(),n=i.find(t=>t.id===e);n&&(a.classList.remove(...Array.from(a.classList).filter(e=>e.startsWith("title-bg-"))),a.style.setProperty("--title-bg-color",n.color));let l=O.posts.filter(t=>t.category===e);if(0===l.length){t.innerHTML='<p style="text-align:center; color:#999; margin-top:2rem;">这个分区还没有内容哦。</p>';return}let r=l.filter(e=>e.isPinned),o=l.filter(e=>!e.isPinned);o.sort((e,t)=>(t.hotness||0)-(e.hotness||0));let s=o.slice(0,2),d=new Set(s.map(e=>e.postId)),c=o.filter(e=>!d.has(e.postId)).sort((e,t)=>new Date(t.timestamp)-new Date(e.timestamp)),m=(t,a="")=>{let i=document.createElement("div");i.className="forum-thread-item-card",i.dataset.postId=t.postId,i.dataset.category=e;let n="";"pinned"===a?n='<span class="thread-tag thread-tag-pinned">置顶</span>':"hot"===a&&(n='<span class="thread-tag thread-tag-hot">热门</span>');let l="",r=t.title||"无标题帖子",o=r.match(/^(?:\[|【)([^\]】]+)(?:\]|】)\s*(.*)$/);if(o){let s=o[1];r=o[2],l=`<span class="thread-tag thread-tag-type">${s}</span>`}let d=_.some(e=>e.id===t.author)||"user"===t.author||"{{user}}"===t.author,c=d?ec(t.author):Z(t.author).avatar,m=d?ed(t.author,null):t.author,p=t.isRead?"thread-read-star read":"thread-read-star",u=t.isRead?"已读":"未读";return i.innerHTML=`
<div class="thread-top-row">
	<span class="thread-hotness">${t.hotness||0}</span>
	${n}
	${l}
	<span class="thread-title">${r}</span>
</div>
<div class="thread-bottom-row">
	<img src="${c}" class="thread-author-avatar">
	<span class="thread-author-name">${m}</span>
	<span class="thread-timestamp">${eT(t.timestamp)}</span>
	<div class="thread-actions">
		<i class="fas fa-star ${p}" title="${u}"></i>
		<i class="fas fa-trash-alt thread-delete-btn" title="删除帖子"></i>
	</div>
</div>
`,i};r.forEach(e=>t.appendChild(m(e,"pinned"))),s.forEach(e=>t.appendChild(m(e,"hot"))),c.forEach(e=>t.appendChild(m(e,"")))}function e_(e){let t=document.getElementById("weibo-detail-view"),a=t.querySelector(".weibo-detail-body"),i=e.postId||e.target_post_id,n=O.posts.find(e=>e.postId===i);if(!n)return;let r=n.author,o=e.author.endsWith("BOT");if(o){let s=document.createElement("div");s.className="forum-bot-reply",s.innerHTML=`
						<i class="fas fa-robot bot-icon"></i>
						<div class="bot-content-wrapper">
							<div class="bot-author-name">${e.author}</div>
							<div class="bot-text">${e.text||e.content}</div>
						</div>
					`,a.appendChild(s);return}let d=a.querySelectorAll(".forum-post-card:not(.is-image-attachment)").length,c=d+1,m=(e,t,a=!1,n=!1)=>{let o=e=>{let t=e.replace(/</g,"&lt;").replace(/>/g,"&gt;");return t.replace(/@([^\s@#]+)/g,(e,t)=>`<span class="mention" data-username="${t}">${e}</span>`)},s=e.author,d;void 0===e.likes&&(e.likes=Math.floor(10*Math.random()));let c=tT();if(c&&s===c.name)d=Z(s);else if(s===A.id||"{{user}}"===s){let m=K(233);d={...A,name:ed("user"),avatar:ec("user"),postCount:233,title:m.text,titleColor:m.color}}else{let p=_.find(e=>e.id===s);if(p){let u=Math.floor(701*Math.random())+300,g=K(u);d={...p,name:ed(p.id),avatar:ec(p.id),postCount:u,title:g.text,titleColor:g.color}}else d=Z(s)}let y="",f=e.text||e.content||"";if(e.replyTo){let h=(O.comments[i]||[]).find(t=>t.commentId===e.replyTo),b;if(h){let v=ed(h.author,null),w=h.text;b=`<div class="forum-quote-block"><div class="quote-author">@${v}</div><div class="quote-content">${w.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div></div>`}else b=`<div class="forum-quote-block"><div class="quote-content">[原消息已删除]</div></div>`;let E=o(f);y=b+E}else{let I=f.match(/\[引用:"(.*?):\s*([\s\S]*?)"\]([\s\S]*)/);if(I){let x=I[1].trim(),$=I[2].trim(),L=I[3].trim(),k=`<div class="forum-quote-block"><div class="quote-author">${o("@"+x)}</div><div class="quote-content">${$.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div></div>`,T=o(L);y=k+T}else y=o(f)}let S="";if(e.image&&e.image_type){let B="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-top: 0.8rem; display: block;";if("url"===e.image_type)S=`<img src="${e.image}" class="post-media-image" style="${B}">`;else if("desc"===e.image_type){let D=l(e.commentId,e.image);S=D?`<div style="${B} overflow: hidden; position: relative;">${D}</div>`:`<div class="forum-image-description">${e.image.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`}}let C=document.createElement("div");C.className=n?"forum-post-card is-image-attachment":"forum-post-card",C.dataset.commentId=e.commentId,C.dataset.authorName=d.name;let M=!1===e.isRead?'<div class="unread-indicator"></div>':"",N=`<div class="forum-user-title" style="border-color: ${d.titleColor}; color: ${d.titleColor};"><i class="fas fa-certificate icon" style="color: ${d.titleColor};"></i><span>${d.title}</span></div>`,P,H;if(n)P=`<div class="forum-user-panel" style="justify-content: flex-start; align-items: flex-start;"><img src="${d.avatar}" alt="${d.name}" class="forum-user-avatar" style="width: 2rem; height: 2rem; margin-bottom: 0;"><i class="fas fa-level-up-alt" style="transform: rotate(90deg); margin-top: 0.5rem; color: var(--forum-divider-color);"></i></div>`,H=`<div class="forum-content-panel"><div class="forum-post-body">${S}</div></div>`;else{let R;P=`
							<div class="forum-user-panel">
								<img src="${d.avatar}" alt="${d.name}" class="forum-user-avatar">
								${R=e.author===r?'<span class="level-tag">楼主</span>':`<div class="forum-user-name">${d.name}</div>`}
								${N}
								<div class="forum-user-meta"><div>发帖 | ${d.postCount}</div></div>
							</div>`,H=`
							<div class="forum-content-panel">
								<div class="forum-post-header">
									<div class="forum-post-level"><span class="level-number">#${t}</span></div>
									<span class="forum-post-timestamp">${eT(e.timestamp)}</span>
								</div>
								<div class="forum-post-body">${y}</div>
								<div class="forum-post-footer" style="justify-content: flex-end; gap: 1rem;">
									<div class="weibo-comment-actions" data-action="delete" data-comment-id="${e.commentId}" title="删除"><i class="far fa-trash-alt"></i> <span>删除</span></div>
									<div class="weibo-comment-actions" data-action="reply" data-comment-id="${e.commentId}" data-author-name="${d.name}" title="回复"><i class="far fa-comment-alt"></i> <span>回复</span></div>
									<div class="weibo-comment-actions"><i class="far fa-thumbs-up"></i> <span>${e.likes||0}</span></div>
								</div>
							</div>`}return C.innerHTML=P+H+M,C},p=e.text&&""!==e.text.trim(),u=e.image&&""!==e.image.trim()&&"none"!==e.image_type;if(p&&u){let g={...e,image:null,image_type:"none"},y=m(g,c,!1,!1);a.appendChild(y);let f={...e,text:"",content:""},h=m(f,0,!1,!0);a.appendChild(h)}else{let b=m(e,c);a.appendChild(b)}}async function eC(e){let t=document.getElementById("forum-profile-view"),a=t.querySelector(".profile-avatar"),i=t.querySelector(".profile-name"),n=t.querySelector(".profile-post-tag"),l=t.querySelector(".profile-signature"),r=document.getElementById("profile-tab-posts"),o=document.getElementById("profile-tab-ama"),s=document.getElementById("profile-tab-footprints"),d="user"===e||"{{user}}"===e?A:_.find(t=>t.id===e);if(!d){console.error(`[Forum Profile] Render failed: Cannot find contact with ID: ${e}`),i.textContent="用户不存在";return}let c="user"===d.id||"{{user}}"===d.id;a.src=ec(d.id),i.textContent=ed(d.id,null),l.textContent=d.signature||"这个人很懒，什么都没留下。";let m=O.posts.filter(e=>e.author===d.id||c&&"{{user}}"===e.author).length;n.textContent=`${m} 篇帖子`,r.innerHTML="";let p=O.posts.filter(e=>e.author===d.id||c&&"{{user}}"===e.author).sort((e,t)=>new Date(t.timestamp)-new Date(e.timestamp));p.length>0?p.forEach(e=>{let t=document.createElement("div");t.className="post-card",t.dataset.postId=e.postId;let a="",i=e.title||"无标题帖子",n=i.match(/^(?:\[|【)([^\]】]+)(?:\]|】)\s*(.*)$/);if(n){let l=n[1],o=n[2];a=`
                    <span class="profile-post-prefix-tag">${l}</span>
                    <span class="profile-post-title-text">${o}</span>
                `}else a=`<span class="profile-post-title-text">${i}</span>`;let s=e.text||e.content||"",d=/#([^#\s]+)/g,c=[...new Set([...s.matchAll(d)].map(e=>e[1]))],m=c.length>0?`<div class="profile-post-hashtags">
                    ${c.map(e=>`<span class="hashtag">#${e}</span>`).join("")}
                </div>`:"",p=s.replace(d,"").trim(),u=(p||"(无正文内容)").substring(0,100)+(p.length>100?"...":"");t.innerHTML=`
                <h3 class="title">${a}</h3>
                <div class="profile-post-content">
                    <p class="excerpt">${u}</p>
                </div>
                ${m} 
                <div class="post-card-footer">
                    <span class="timestamp">${eT(e.timestamp)}</span>
                    <div class="post-card-stats" style="display: flex; gap: 0.8rem;">
                        <span><i class="fas fa-share"></i> ${e.retweets||0}</span>
                        <span><i class="far fa-comment-alt"></i> ${(O.comments[e.postId]||[]).length}</span>
                        <span><i class="far fa-thumbs-up"></i> ${e.likes||0}</span>
                    </div>
                </div>
            `,r.appendChild(t)}):r.innerHTML='<p style="text-align:center; color: var(--forum-text-secondary); padding: 2rem;">TA还没有发布过任何帖子。</p>';let u="user"===d.id||"{{user}}"===d.id;if(o.innerHTML="",u){let g=document.createElement("p");g.style.cssText="text-align:center; color: var(--forum-text-secondary); padding: 2rem;",g.textContent="这里是你的匿名提问箱。",o.appendChild(g)}else{let y=document.createElement("div");y.className="ama-input-box",y.innerHTML=`
            <div class="ama-input-header">匿名向TA提问</div>
            <div class="ama-input-body">
                <textarea rows="2" placeholder="输入你的问题..."></textarea>
            </div>
            <div class="ama-input-footer">
                <span id="view-more-ama-btn">🔍 查看更多</span>
                <button><i class="fas fa-paper-plane"></i></button>
            </div>
        `,o.appendChild(y)}let f=document.createElement("div");if(f.className="ama-qna-list",o.appendChild(f),w){let h=w.logEntries.filter(t=>"AMA_PAIR"===t.key&&(t.data.author===e||c&&"{{user}}"===t.data.author)).sort((e,t)=>new Date(t.data.timestamp)-new Date(e.data.timestamp));if(u&&h.length>0){let b=o.querySelector("p");b&&(b.style.display="none")}h.forEach(e=>{let t=e.data,a=document.createElement("div");a.className="qna-card",a.innerHTML=`
                <div class="question"><p>${t.question.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p></div>
                <div class="answer">
                    <div class="answer-content">
                        <p class="author">${ed(t.author,null)}</p>
                        <p>${t.answer.replace(/\n/g,"<br>")}</p>
                    </div>
                </div>
            `,f.appendChild(a)})}s.innerHTML="";let v=[];for(let E in O.comments)O.comments[E].forEach(e=>{(e.author===d.id||c&&"{{user}}"===e.author)&&v.push({...e,post:O.posts.find(e=>e.postId===E)})});v.sort((e,t)=>new Date(t.timestamp)-new Date(e.timestamp)),v.length>0?v.forEach(e=>{if(!e.post)return;let t=e.text,a=t.match(/\[引用:"(?:.*?):\s*(?:[\s\S]*?)"\]([\s\S]*)/);a&&a[1]&&(t=a[1].trim());let i=document.createElement("div");i.className="footprint-item",i.innerHTML=`
                <div class="icon"><i class="far fa-comment-alt"></i></div>
                <div class="content">
                    <p class="action">
                        在帖子
                        <span class="post-link" data-post-id="${e.post.postId}">${e.post.title}</span>
                        中发表了评论
                    </p>
                    <div class="quote">${t.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
                </div>
            `,s.appendChild(i)}):s.innerHTML='<p style="text-align:center; color: var(--forum-text-secondary); padding: 2rem;">TA还没有发表过任何评论。</p>'}function eA(e){let t=O.posts.find(t=>t.postId===e);if(!t)return;let a=document.getElementById("weibo-detail-view"),i=a.querySelector(".weibo-detail-body"),n=a.querySelector(".weibo-detail-title");i.innerHTML="",J.clear(),n.textContent="";let r=t.author;void 0===t.likes&&(t.likes=Math.floor(1e3*Math.random())),void 0===t.retweets&&(t.retweets=Math.floor(51*Math.random())),void 0===t.bookmarks&&(t.bookmarks=Math.floor(21*Math.random()));let o=(t,a,i=!1,n=!1)=>{let o=e=>{let t=e.replace(/</g,"&lt;").replace(/>/g,"&gt;");return t.replace(/@([^\s@#]+)/g,(e,t)=>`<span class="mention" data-username="${t}">${e}</span>`)},s=t.author,d;if(void 0===t.likes&&(t.likes=Math.floor(10*Math.random())),"user"===s||"{{user}}"===s){let c=K(233);d={...A,name:ed("user"),avatar:ec("user"),postCount:233,title:c.text,titleColor:c.color}}else{let m=_.find(e=>e.id===s);if(m){let p=Math.floor(701*Math.random())+300,u=K(p);d={...m,name:ed(m.id),avatar:ec(m.id),postCount:p,title:u.text,titleColor:u.color}}else d=Z(s)}let g="",y=t.text||t.content||"";if(t.replyTo){let f=(O.comments[e]||[]).find(e=>e.commentId===t.replyTo),h;if(f){let b=ed(f.author,null),v=f.text;h=`<div class="forum-quote-block"><div class="quote-author">@${b}</div><div class="quote-content">${v.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div></div>`}else h=`<div class="forum-quote-block"><div class="quote-content">[原消息已删除]</div></div>`;let w=o(y);g=h+w}else{let E=y.match(/\[引用:"(.*?):\s*([\s\S]*?)"\]([\s\S]*)/);if(E){let I=E[1].trim(),x=E[2].trim(),$=E[3].trim(),L=`<div class="forum-quote-block"><div class="quote-author">${o("@"+I)}</div><div class="quote-content">${x.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div></div>`,k=o($);g=L+k}else g=o(y)}let T="";if(t.image&&t.image_type){let S="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-top: 0.8rem; display: block;";if("url"===t.image_type)T=`<img src="${t.image}" class="post-media-image" style="${S}">`;else if("desc"===t.image_type){let B=l(t.commentId||t.postId,t.image);T=B?`<div style="${S} overflow: hidden; position: relative;">${B}</div>`:`<div class="forum-image-description">${t.image.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`}}let D=document.createElement("div");D.className=i?"forum-post-card is-op":n?"forum-post-card is-image-attachment":"forum-post-card",D.dataset.commentId=t.commentId||"post-op",D.dataset.authorName=d.name;let C=!1===t.isRead?'<div class="unread-indicator"></div>':"";if(i){let M=`
				<div class="forum-user-panel">
					<img src="${d.avatar}" alt="${d.name}" class="forum-user-avatar">
					<div class="op-user-info-wrapper">
						<div class="forum-user-name">${d.name}</div>
						<span class="level-tag">楼主</span>
					</div>
				</div>`,N=t.title||"",P=N.match(/^\[([^\]]+)\]\s*(.*)$/);P&&(N=P[2]);let H=`
				<hr class="forum-title-divider">
				<div class="forum-post-title-area">
					<h1>${N}</h1>
				</div>
				<hr class="forum-title-divider">
			`,R="",q=/#([^#\s]+)/g,U=[...(t.text||"").matchAll(q)].map(e=>e[1]);if(U.length>0){let G=[...new Set(U)];R=`
					<div class="forum-post-hashtags">
						${G.map(e=>`<span class="hashtag">#${e}</span>`).join("")}
					</div>
				`,g=g.replace(q,"").trim()}let W=(O.comments[e]||[]).length,j=`
				<div class="forum-content-panel" style="margin-top:0;">
					<div class="forum-post-body">${g}${T}</div>
					${R}
					<div class="forum-post-footer">
						<span class="forum-post-timestamp" style="margin-right: auto;">${eT(t.timestamp)}</span>
						<div class="weibo-comment-actions-group">
							<div class="weibo-comment-actions"><i class="fas fa-share"></i><span>${t.retweets||0}</span></div>
							<div class="weibo-comment-actions"><i class="far fa-comment-alt"></i><span>${W}</span></div>
							<div class="weibo-comment-actions"><i class="far fa-thumbs-up"></i><span>${t.likes||0}</span></div>
						</div>
					</div>
				</div>`;D.innerHTML=M+H+j}else{let Y=t.author.endsWith("BOT");if(Y){let z=document.createElement("div");return z.className="forum-bot-reply",z.innerHTML=`
						<i class="fas fa-robot bot-icon"></i>
						<div class="bot-content-wrapper">
							<div class="bot-author-name">${t.author}</div>
							<div class="bot-text">${t.text||t.content}</div>
						</div>
					`,z}{void 0===t.likes&&(t.likes=Math.floor(10*Math.random()));let F,V,X=`<div class="forum-user-title" style="border-color: ${d.titleColor}; color: ${d.titleColor};"><i class="fas fa-certificate icon" style="color: ${d.titleColor};"></i><span>${d.title}</span></div>`;if(n)F=`<div class="forum-user-panel" style="justify-content: flex-start; align-items: flex-start;"><img src="${d.avatar}" alt="${d.name}" class="forum-user-avatar" style="width: 2rem; height: 2rem; margin-bottom: 0;"><i class="fas fa-level-up-alt" style="transform: rotate(90deg); margin-top: 0.5rem; color: var(--forum-divider-color);"></i></div>`,V=`<div class="forum-content-panel"><div class="forum-post-body">${T}</div></div>`;else{let J;F=`
						<div class="forum-user-panel">
							<img src="${d.avatar}" alt="${d.name}" class="forum-user-avatar">
							${J=t.author===r||"user"===r&&"{{user}}"===t.author||"{{user}}"===r&&"user"===t.author?'<span class="level-tag">楼主</span>':`<div class="forum-user-name">${d.name}</div>`}
							${X}
							<div class="forum-user-meta"><div>发帖 | ${d.postCount}</div></div>
						</div>`,V=`
						<div class="forum-content-panel">
							<div class="forum-post-header">
								<div class="forum-post-level"><span class="level-number">#${a}</span></div>
								<span class="forum-post-timestamp">${eT(t.timestamp)}</span>
							</div>
							<div class="forum-post-body">${g}</div>
							<div class="forum-post-footer" style="justify-content: flex-end; gap: 1rem;">
								<div class="weibo-comment-actions" data-action="delete" data-comment-id="${t.commentId}" title="删除"><i class="far fa-trash-alt"></i> <span>删除</span></div>
								<div class="weibo-comment-actions" data-action="reply" data-comment-id="${t.commentId}" data-author-name="${d.name}" title="回复"><i class="far fa-comment-alt"></i> <span>回复</span></div>
								<div class="weibo-comment-actions"><i class="far fa-thumbs-up"></i> <span>${t.likes||0}</span></div>
							</div>
						</div>`}D.innerHTML=F+V+C}}return D.dataset.level=a,D},s=o(t,1,!0);i.appendChild(s);let d=(O.comments[e]||[]).slice().sort((e,t)=>new Date(e.timestamp)-new Date(t.timestamp)),c=2;d.forEach(e=>{let t=e.text&&""!==e.text.trim(),a=e.image&&""!==e.image.trim()&&"none"!==e.image_type;if(t&&a){let n={...e,image:null,image_type:"none"},l=o(n,c,!1,!1);i.appendChild(l),c++;let r={...e,text:"",content:""},s=o(r,0,!1,!0);i.appendChild(s)}else{let d=o(e,c);i.appendChild(d),c++}}),a.dataset.postId=e,a.dataset.currentPostId=e,a.querySelector(".weibo-send-comment-btn").dataset.postId=e}async function eM(e){let t=e.target.dataset.postId;if(!t)return;let a=O.posts.find(e=>e.postId===t);if(!a)return;let i=await showDialog({mode:"confirm",text:"确定要删除这条帖子吗？此操作不可恢复。"});if(i){w.logEntries=w.logEntries.filter(e=>("WEIBO_POST"!==e.key||e.data.postId!==t)&&("WEIBO_COMMENT"!==e.key&&"WEIBO_LIKE"!==e.key||e.data.postId!==t&&e.data.target_post_id!==t)),e3(),await w.persistLogToStorage();let n=a.category,l=document.querySelector(`.weibo-zone-card[data-category="${n}"]`),r=l?l.querySelector(".zone-title").textContent:"帖子列表";eD(n),ep("weiboFeed",{category:n,categoryName:r}),await showDialog({mode:"alert",text:"帖子已删除。"})}}function eN(){let e=document.querySelectorAll("#weibo-view .weibo-zone-card");e.forEach(e=>{let t=e.dataset.category,a=e.querySelector(".zone-status-indicator");if(!t||!a)return;let i=O.posts.some(e=>e.category===t);i?a.classList.add("visible"):a.classList.remove("visible")})}function eO(e){let t=e.currentTarget,a=t.dataset.replyTo;if(a){let i=document.querySelector("#weibo-detail-view .weibo-comment-input");i.value=`回复 @${a}: `,i.focus(),i.setSelectionRange(i.value.length,i.value.length)}}function e0(e,t){let a=e.trim().split("\n"),i=/^WEIBO_POST:(.*)$/;a.forEach(e=>{let a=e.trim().match(i);if(a)try{let n=JSON.parse(a[1]);n.postId=`weibo_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,n.category=t,w.logEntries.some(e=>"WEIBO_POST"===e.key&&e.data.postId===n.postId)||(w.addEntry({key:"WEIBO_POST",data:n}),console.log(`[BLMX Weibo] Stored new post: ${n.postId} in category ${n.category}`))}catch(l){console.error("[BLMX Weibo] Failed to parse WEIBO_POST JSON:",a[1],l)}}),e3()}function eP(e){let t=document.querySelector("#diary-entry-view .diary-entry-body"),a=_.find(t=>t.id===e);a&&a.diaryWallpaper?t.style.backgroundImage=`url("${a.diaryWallpaper}")`:diaryEntrybody.style.backgroundImage="none"}async function eH(){let e=document.getElementById("diary-entry-view"),t=e.dataset.ownerId;if(!t){await showDialog({mode:"alert",text:"错误：找不到日记主人信息。"});return}let a=_.find(e=>e.id===t);if(!a)return;let i=await showDialog({mode:"prompt",text:`为 ${ed(a.id,null)} 的日记设置背景图URL：
（留空则恢复默认）`,defaultValue:a.diaryWallpaper||""});null!==i&&(a.diaryWallpaper=i.trim()||void 0,el(),eP(t),await showDialog({mode:"alert",text:"背景已更新！"}))}async function eR(){let e=document.getElementById("diary-entry-view"),t=parseInt(e.dataset.viewingIndex,10);if(isNaN(t)||t<0){await showDialog({mode:"alert",text:"错误：当前没有可删除的日记。"});return}let a=await showDialog({mode:"confirm",text:"确定要永久删除这篇日记吗？此操作不可撤销。"});if(a){w.logEntries.splice(t,1),await w.persistLogToStorage(),await showDialog({mode:"alert",text:"日记已删除。"});let i=e.dataset.ownerId;ep("diaryEntry",{ownerId:i})}}function eP(e){let t=document.getElementById("diary-entry-view");if(!t)return;let a=_.find(t=>t.id===e);a&&a.diaryWallpaper?t.style.backgroundImage=`url("${a.diaryWallpaper}")`:t.style.backgroundImage="none"}function eq(){let e=document.querySelector(".diary-bookmarks-container");if(e.innerHTML="",!w)return;let t=[...new Set(w.logEntries.filter(e=>"DIARY_ENTRY"===e.key).map(e=>e.data.author))];t.forEach(t=>{let a=document.createElement("div");a.className="diary-bookmark-item",a.textContent=ed(t,null),a.dataset.authorId=t,a.addEventListener("click",e=>{e.stopPropagation();let t=e.currentTarget.dataset.authorId;t&&ep("diaryEntry",{ownerId:t})}),e.appendChild(a)})}function e3(){for(let e in O.posts=[],O.comments={},O.likes={},w.logEntries.forEach(e=>{if("WEIBO_POST"===e.key)O.posts.push(e.data);else if("WEIBO_COMMENT"===e.key){let t=e.data,a=t.postId||t.target_post_id;a?(O.comments[a]||(O.comments[a]=[]),O.comments[a].push(t)):console.warn("[BLMX Weibo] Found a comment without a valid postId or target_post_id:",t)}else if("WEIBO_LIKE"===e.key){let i=e.data,n=i.postId||i.target_post_id;n&&(O.likes[n]||(O.likes[n]=[]),O.likes[n].includes(i.author)||O.likes[n].push(i.author))}}),O.comments)O.comments[e].sort((e,t)=>new Date(e.timestamp)-new Date(t.timestamp));console.log("[BLMX Weibo] Weibo data cache updated from log.",O),eN()}function e1(e){if(!T){alert("错误：没有活动的聊天窗口。");return}let t=C.find(e=>e.id===T);if(t&&t.muted&&(t.muted.user||t.muted["{{user}}"])){let a=t.muted.user||t.muted["{{user}}"],i=new Date(a);if(new Date<i){alert("你已被禁言！");return}}let n={...e,conversationId:T,sender:"{{user}}",id:`msg-pending-${Date.now()}-${Math.random()}`};t&&(t.lastActivity=new Date(window.currentGameDate).getTime()),E.push(n),e$(T),eX()}async function eU(e,t=!1){if(b||!w)return;x=!1;let a=!!e&&!t&&await showDialog({mode:"confirm",text:"是否启用全局模式进行回复？\n(是 = AI可回复所有新消息的对话)\n(否 = AI仅回复当前对话)"});b=!0,eX();let i=[];if(t&&T?i.push(T):a?(i=C.filter(e=>E.some(t=>t.conversationId===e.id)).map(e=>e.id),I&&T&&!i.includes(T)&&i.push(T)):i=E.length>0?[E[0].conversationId]:T?[T]:[],e&&0===E.length&&0===i.length&&T&&i.push(T),0===i.length){b=!1,eX();return}let n=[...E];E=[],I=!1,n.forEach(e=>w.addEntry(e));let l=new Date(window.currentGameDate);C.forEach(e=>{if(e.muted)for(let t in e.muted)l>=new Date(e.muted[t])&&(delete e.muted[t],w.addEntry({type:"group_event",content:{type:"unmute_auto",convoId:e.id,targetId:t,timestamp:l.toISOString().substring(0,16).replace("T"," ")}}))}),await w.persistLogToStorage();let r;if(t){let o=C.find(e=>e.id===T);r=function e(t){let a=t.name,i=t.members.filter(e=>"user"!==e&&"{{user}}"!==e).map(e=>ed(e,t.id)).join("、"),n=`
[任务：续写私下对话]

**情景设定**:
你正在扮演角色 ${i}，他们正在群聊“${a}”中进行一场**没有 {{user}} 参与**的私下对话。

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

*   **针对本次对话的格式示例**: \`[${t.id}] ${t.members.find(e=>"user"!==e)}: 示例文本...\`

现在，请开始续写这场私下对话。
`;return n.trim()}(o)}else r=w.getContextForAI(i,_,C,a,t,{});N=r;try{let s=await v({user_input:r,should_stream:!1});M=s.trim();let c=s.trim().split("\n").filter(e=>e.trim());if(c.length>0){let m=["EVENT_LOG","GROUP_EVENT","SIGNATURE_UPDATE","RECALL_MESSAGE","CREATE_GROUP","KICK_MEMBER","LEAVE_GROUP","MUTE_MEMBER","SET_ADMIN","CHANGE_NICKNAME","RENAME_GROUP"],p=[],u=!1;for(let g of c){let y=g.match(/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/),f=g.match(/^([A-Z_]+):/);if(y)e4(y[3],y[2].trim(),y[1]);else if(f&&m.includes(f[1]))try{let h=f[1],$=JSON.parse(g.substring(h.length+1));eV(h,$)}catch(L){console.error(`[BLMX trigger] 解析聊天指令失败: "${g}"`,L)}else p.push(g)}p.length>0&&(u=!0,await ao(p.join("\n"))),x&&!u&&(console.log("[BLMX UI Fix] 安全网触发：为纯聊天消息刷新UI。"),d.wechatChat.classList.contains("active")&&e$(T),ts(),tc())}}catch(k){console.error("[BLMX] AI generation failed:",k),await showDialog({mode:"alert",text:`AI响应失败: ${k.message}`})}await w.persistLogToStorage(),el(),b=!1,eX()}async function eG(){if(b){await showDialog({mode:"alert",text:"AI正在处理其他任务，请稍后再试。"});return}if(w.logEntries.length<10){await showDialog({mode:"alert",text:"历史记录过少，无需存档。"});return}console.log("[Archive] Starting AI Summary and Clear process..."),b=!0,eX(),await showDialog({mode:"alert",text:"AI正在阅读并总结所有历史记录，这可能需要一些时间，请耐心等待..."});try{let e=function e(){let t=`[任务：生成详细的结构化历史档案]

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
`,a="\n\n--- 手机记录: 微信聊天 ---\n",i=w.logEntries.filter(e=>e.conversationId&&e.type&&!["event_log","group_event"].includes(e.type));i.forEach(e=>{let t=C.find(t=>t.id===e.conversationId),i;if(t){if("group"===t.type||"vgroup"===t.type)i=t.name;else if("single"===t.type){let n=t.members.map(e=>ed(e,null));i=`${n.join("与")}的私聊`}else i="未知聊天"}else i="未知聊天";let l=ed(e.sender,e.conversationId),r="";switch(e.type){case"message":r=e.content;break;case"voice":r=`[发送了语音: "${e.content.text}"]`;break;default:r=`[发送了 ${e.type}]`}a+=`[在${i}] ${l}: ${r}
`});let n="\n\n--- 手机记录: 朋友圈 ---\n",l=w.logEntries.filter(e=>"MOMENT"===e.key);l.forEach(e=>{let t=e.data;n+=`[作者: ${ed(t.author,null)} 时间: ${t.timestamp}]: "${t.text||"(图片动态)"}"
`;let a=w.logEntries.filter(e=>("CHAR_LIKE"===e.key||"CHAR_COMMENT"===e.key)&&e.data.target_post_id===t.momentId);a.forEach(e=>{"CHAR_LIKE"===e.key?n+=` - 点赞: ${ed(e.data.author,null)}
`:n+=` - 评论 by ${ed(e.data.author,null)}: "${e.data.text}"
`})});let r="\n\n--- 手机记录: 论坛 ---\n",o=w.logEntries.filter(e=>"WEIBO_POST"===e.key);o.forEach(e=>{let t=e.data;r+=`[作者: ${ed(t.author,null)} 分区: ${t.category}]: "${t.title||t.text}"
`});let s="\n\n--- 手机记录: 日记 ---\n",d=w.logEntries.filter(e=>"DIARY_ENTRY"===e.key);d.forEach(e=>{let t=e.data,a=(t.content||"").substring(0,100);s+=`[作者: ${ed(t.author,null)} 时间: ${t.timestamp} 标题: "${t.title}"]: ${a}...
`});let c="\n\n--- 手机记录: 其他重要事件 ---\n",m=w.logEntries.filter(e=>["SIGNATURE_UPDATE","EVENT_LOG","GROUP_EVENT"].includes(e.key||e.type));m.forEach(e=>{let t=e.key||e.type.toUpperCase();switch(t){case"SIGNATURE_UPDATE":c+=`[签名更新 by ${ed(e.data.author,null)}]: "${e.data.signature}"
`;break;case"EVENT_LOG":c+=`[系统事件]: ${e.content.description}
`;break;case"GROUP_EVENT":c+=`[群聊事件]: ${eL(e.content)}
`}});let p=t+a+n+r+s+c;return p}();N=e;let t=await v({user_input:e,should_stream:!1});M=t;let a="AI未能生成有效的总结。历史记录未被清除。",i=!1;try{let n=JSON.parse(t.trim());n.summary&&"string"==typeof n.summary&&n.summary.trim()&&(a=`【历史存档摘要】:
${n.summary.trim()}`,i=!0)}catch(l){console.error("[Archive] AI returned invalid JSON. Using raw response as summary.",l,t),a=`【历史存档摘要】:
AI未能按格式生成总结，原始回复为：
${t.trim()}`}if(i){let r=w.messageId;await window.parent.TavernHelper.setChatMessage(a,r,{refresh:"none"}),w.logEntries=[],w.messageId=await window.parent.TavernHelper.getLastMessageId(),e3(),ts(),tc(),d.wechatChat.classList.contains("active")&&e$(T),await showDialog({mode:"alert",text:"历史记录已成功总结并存档！手机性能已恢复。"})}else await showDialog({mode:"alert",text:a})}catch(o){console.error("[Archive] AI summary generation failed:",o),await showDialog({mode:"alert",text:`AI总结失败: ${o.message}`})}finally{b=!1,eX()}}function eW(){return new Promise(e=>{let t=document.getElementById("group-chat-modal"),a=document.getElementById("group-chat-contact-list-container"),i=document.getElementById("group-chat-modal-header"),n=document.getElementById("group-chat-modal-footer");a.innerHTML="",i.querySelector(".title").textContent="选择一个作者",i.querySelector("#group-chat-confirm-btn").style.display="none",n.style.display="none";let l=i=>{let n=a.cloneNode(!1);a.parentNode.replaceChild(n,a),t.style.display="none",e(i)},r=i.querySelector("#group-chat-cancel-btn"),o=r.cloneNode(!0);r.parentNode.replaceChild(o,r),o.onclick=()=>l(null),_.forEach(e=>{let t=document.createElement("div");t.className="group-chat-contact-item",t.style.cursor="pointer",t.innerHTML=`
                <img src="${ec(e.id)}" alt="${ed(e.id,null)}">
                <span>${ed(e.id,null)}</span>
            `,t.addEventListener("click",()=>{l(e.id)}),a.appendChild(t)}),t.style.display="flex"})}function ej(e){let t=au(),a=t.find(t=>t.id===e);return a&&a.communityBible?a.communityBible:(console.warn(`[AI Context] Could not find community bible for category: ${e}. Using fallback.`),"【错误】未找到对应的社区说明。请基于通用知识进行创作。")}async function eY(){if(b){await showDialog({mode:"alert",text:"AI正在生成中，请稍后再试。"});return}document.getElementById("weibo-feed-view");let e=document.getElementById("weibo-feed-title"),t=e.textContent,a="",n=Array.from(document.querySelectorAll(".weibo-zone-card")).find(e=>e.querySelector(".zone-title").textContent===t);if(n)a=n.dataset.category;else{await showDialog({mode:"alert",text:"错误：无法确定当前帖子分区。"});return}let l=await af({title:"发布新微博",fields:[{id:"title",label:"帖子标题",type:"text"},{id:"body",label:"帖子正文",type:"textarea"},{id:"image_url",label:"图片链接 (可选, 优先使用)",type:"text"},{id:"image_desc",label:"或 图片描述 (可选)",type:"text"}]});if(null===l)return;let{title:r,body:o,image_url:s,image_desc:d}=l,c="",m="none";if(s&&s.trim()?(m="url",c=s.trim()):d&&d.trim()&&(m="desc",c=d.trim()),!r.trim()&&!o.trim()&&!c.trim()){await showDialog({mode:"alert",text:"标题、正文和图片至少需要填写一项。"});return}let p=await showDialog({mode:"confirm",text:"如何发布这篇帖子？\n\n(确定 = 匿名发布)\n(取消 = 实名发布)"}),u;if(p){let g=tT();if(g&&g.name)u=g.name;else{await showDialog({mode:"alert",text:"请先通过右上角的齿轮设置您的马甲才能匿名发帖。"});return}}else u=A.id;let y={author:u,title:r,text:o,image_type:m,image:c,postId:`weibo_${Date.now()}_${Math.random().toString(36).substr(2,9)}_${A.id}`,category:a,timestamp:new Date(window.currentGameDate).toISOString(),likes:Math.floor(100*Math.random()),retweets:Math.floor(21*Math.random()),bookmarks:Math.floor(11*Math.random())};w.addEntry({key:"WEIBO_POST",data:y}),"desc"===y.image_type&&y.image&&i(y.postId,y.image,"weibo"),await w.persistLogToStorage(),e3(),eD(a),ep("weiboFeed",{category:a,categoryName:t}),await showDialog({mode:"alert",text:`新帖子已成功发布！`})}async function e7(){if(b){await showDialog({mode:"alert",text:"AI正在生成中，请稍后再试。"});return}let e=document.getElementById("diary-entry-view").dataset.ownerId;if(!e){console.error("创建日记失败：无法获取日记主人ID。"),await showDialog({mode:"alert",text:"无法确定为谁写日记，请返回封面页重新进入。"});return}let t=ed(e,null),a=await showDialog({mode:"confirm",text:`是否要探寻一下 ${t} 此刻的心事，并让Ta记录下来？`});a&&(await showDialog({mode:"alert",text:`正在探寻 ${t} 的心事，请稍候...`}),await ez(e))}async function ez(e){if(b){await showDialog({mode:"alert",text:"AI正在生成中，请稍后再试。"});return}console.log(`[日记功能] 开始为 ${e} 创建日记...`),b=!0,eX();let t=function e(t){let a=_.find(e=>e.id===t);if(!a)return console.error(`[日记功能] 无法为 ${t} 创建上下文，角色不存在。`),null;let i=`
[SYSTEM NOTE: HIGH-QUALITY DIARY ENTRY CREATION TASK]

**Core Role to Portray:**
Your only identity is **【${ed(t,null)} (ID: ${t})】**.
You must deeply embody this character's personality, memories, and current mood.

**Task Instruction:**
Based on your character's persona and your memory of recent events, write a new diary entry. Your response must contain all of the following elements.

**【CRITICAL】Output Format:**
You **must strictly** follow this JSON format. Do not output any other text or explanations. The "content" field should be **plain text**, with paragraphs separated by newlines.

DIARY_ENTRY:{"title": "日记标题", "weather": "天气状况", "content": "日记正文第一段...\\n\\n日记正文第二段..."}

**【CRITICAL】Content Rules:**
1. **Length:** The "content" must be **around 300 Chinese characters**.
2. **Formatting:** The "content" must be **plain text only**. Do NOT use any HTML tags like <p>, <del>, etc. Use newline characters (\\n) to separate paragraphs.
		
		Now, as **【${ed(t,null)}】**, please begin writing your diary entry strictly following the JSON format above.
		`;return i.trim()}(e);if(!t){await showDialog({mode:"alert",text:"无法生成AI指令，请检查角色是否存在。"}),b=!1,eX();return}N=t;try{let a=await v({user_input:t,should_stream:!1});M=a,a.trim()?(await ao(a),await showDialog({mode:"alert",text:`${ed(e,null)} 的新日记已写好！`})):await showDialog({mode:"alert",text:"AI未能生成有效的日记内容。"})}catch(i){console.error(`[日记功能] AI生成日记失败:`,i),await showDialog({mode:"alert",text:`AI响应失败: ${i.message}`})}finally{b=!1,eX(),document.getElementById("diary-entry-view").classList.contains("active")&&ep("diaryEntry",{ownerId:e})}}async function e2(){if(b){await showDialog({mode:"alert",text:"AI正在思考中，请稍后再试。"});return}let e=await showDialog({mode:"confirm",text:"是否要让时间流逝，看看角色们发生了什么？\n(这将消耗一次API调用来生成全局动态)"});if(e){b=!0,eX(),await showDialog({mode:"alert",text:"正在捕捉世界动态，请稍候..."});try{let t=function e(){let t=au(),a=t.map(e=>`- 【${e.title}】(ID: ${e.id})`).join("\n"),i=`
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
${a}
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
`;return i.trim()}();if(!t)throw Error("无法生成有效的AI上下文。");N=t;let a=await v({user_input:t,should_stream:!1});if(M=a.trim()){await eF(M);let i=M.split("\n").filter(e=>e.trim()),n=[];for(let l of i){let r=l.match(/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/);if(r){let o=r[1],s=r[2].trim(),d=r[3];e4(d,s,o)}else n.push(l)}n.length>0?await ao(n.join("\n")):(ts(),tc()),await showDialog({mode:"alert",text:"世界动态已同步！"})}else await showDialog({mode:"alert",text:"时间静止，角色们似乎都在休息。"})}catch(c){console.error("[BLMX World Snapshot] AI generation failed:",c),await showDialog({mode:"alert",text:`世界快照生成失败: ${c.message}`})}finally{b=!1,eX()}}}async function eF(e){return new Promise(t=>{let a=document.getElementById("world-snapshot-modal"),i=document.getElementById("world-snapshot-content"),n=document.getElementById("world-snapshot-close-btn"),l=`<h3>【世界动态快照：${Math.floor(3*Math.random())+2}小时后】</h3>`,r=e.trim().split("\n");r.forEach(e=>{let t="",a=e.match(/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/);if(a){let i=a[1],n=a[2].trim(),r=a[3],o="",s=i.match(/^convo_single_(.+)$/),d=i.match(/^convo_group_(.+)$/);if(s){let c=s[1];o=`<strong>${ed(n,null)}</strong> 私下对 <strong>${ed(n===c?"user":c,null)}</strong> 说：“${r.substring(0,50)}...”`}else if(d){let m=C.find(e=>e.id===i),p=m?m.name:"一个群聊";o=`<strong>${ed(n,i)}</strong> 在群聊“${p}”中说：“${r.substring(0,50)}...”`}o&&(t=`
<div class="snapshot-item">
	<div class="snapshot-icon type-wechat"><i class="fab fa-weixin"></i></div>
	<div class="snapshot-text">${o}</div>
</div>`)}else{let u=e.match(/^([A-Z_]+):(.*)$/);if(u){let g=u[1];try{let y=JSON.parse(u[2]),f="",h="type-system",b='<i class="fas fa-cog"></i>';switch(g){case"WEIBO_POST":let v=au().find(e=>e.id===y.category),w=v?v.title:"某个分区";f=`<strong>${ed(y.author,null)}</strong> 在 <strong>【${w}】</strong> 发布了新帖子：“${y.title}”`,h="type-forum",b='<i class="fas fa-fire"></i>';break;case"MOMENT":f=`<strong>${ed(y.author,null)}</strong> 发布了一条新动态：“${(y.text||"[图片动态]").substring(0,50)}...”`,h="type-moments",b='<i class="far fa-images"></i>';break;case"WEIBO_COMMENT":let E=O.posts.find(e=>e.postId===y.target_post_id),I=E?E.title:"一个帖子";f=`<strong>${ed(y.author,null)}</strong> 评论了帖子“${I}”`,h="type-forum",b='<i class="fas fa-fire"></i>';break;case"SIGNATURE_UPDATE":f=`<strong>${ed(y.author,null)}</strong> 的个性签名更新为：“${y.signature}”`,h="type-system",b='<i class="fas fa-user-edit"></i>';break;case"EVENT_LOG":f=`<strong>[世界事件]</strong> ${y.description}`,h="type-system",b='<i class="fas fa-globe-asia"></i>'}f&&(t=`
<div class="snapshot-item">
	<div class="snapshot-icon ${h}">${b}</div>
	<div class="snapshot-text">${f}</div>
</div>`)}catch(x){}}}t&&(l+=t)}),i.innerHTML=l;let o=()=>{a.style.display="none",n.onclick=null,t()};n.onclick=o,a.style.display="flex"})}function eV(e,t,a=null){if(t&&t.convoId&&"string"==typeof t.convoId&&(t.convoId=t.convoId.replace(/[\[\]]/g,"")),t&&t.convoId&&t.convoId.startsWith("convo_group_")){let n=t.convoId.substring(12).split("-");n.sort(),t.convoId=`convo_group_${n.join("-")}`}if("WEIBO_POST"===e||"WEIBO_COMMENT"===e||"WEIBO_LIKE"===e||"DELETE_WEIBO_POST"===e){if("WEIBO_POST"===e&&(t.likes=Math.floor(1e3*Math.random()),t.retweets=Math.floor(51*Math.random()),t.bookmarks=Math.floor(21*Math.random())),"WEIBO_COMMENT"===e&&(t.likes=Math.floor(10*Math.random()),t.commentId=`comment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,t.isRead=!1,a)){let l=t.target_post_id;l!==a&&(console.warn(`[AI Data Correction] Post ID mismatch! Forcibly changing target_post_id from '${l}' to '${a}'.`),t.target_post_id=a)}t.timestamp||"DELETE_WEIBO_POST"===e||(t.timestamp=new Date(window.currentGameDate).toISOString()),w.addEntry({key:e,data:t});return}if("DIARY_ENTRY"===e){t.author=document.getElementById("diary-entry-view").dataset.ownerId,t.timestamp=new Date(window.currentGameDate).toISOString(),w.addEntry({key:"DIARY_ENTRY",data:t});return}switch(t.convoId&&t.timestamp&&eS(t.convoId,t.timestamp),e){case"EVENT_LOG":w.addEntry({type:e.toLowerCase(),content:t});break;case"SIGNATURE_UPDATE":{let r=t.author,o=null;(o="user"===r||"{{user}}"===r?A:_.find(e=>e.id===r))&&(o.signature=t.signature,w.addEntry({key:e,data:t}),el());break}case"RECALL_MESSAGE":w.addEntry({key:e,data:t});break;case"MOMENT":if(t.momentId||(t.momentId=`moment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`),"desc"===t.image_type&&t.image&&i(t.momentId,t.image,"moment"),w.addEntry({key:e,data:t}),"user"!==t.author&&"{{user}}"!==t.author){let s=C.find(e=>"moments_feed"===e.id);if(s&&(s.unread=(s.unread||0)+1,eS("moments_feed",t.timestamp)),!document.getElementById("moments-view").classList.contains("active")){let d=ed(t.author,null),c=t.text?t.text:"[图片动态]";em("moments_feed",d,c)}}lastProcessedMomentId=t.momentId;break;case"CHAR_COMMENT":case"CHAR_LIKE":{w.addEntry({key:e,data:t});let m=w.logEntries.map((e,t)=>({...e,originalIndex:t})).filter(e=>"MOMENT"===e.key),p=m.find(e=>e.data.momentId===String(t.target_post_id));if(p&&("user"===p.data.author||"{{user}}"===p.data.author)){let u=C.find(e=>"moments_feed"===e.id);u&&(u.unread=(u.unread||0)+1,eS("moments_feed",new Date(window.currentGameDate).toISOString()))}break}case"INVITE_MEMBER":{let g=C.find(e=>e.id===t.convoId),y=t.targetId;if(g&&"group"===g.type&&y){let f="user"===y||"{{user}}"===y||y===A.name,h=f?"user":y;if(!g.members.includes(h)){g.members.push(h),f&&(g.userIsObserver=!1);let b={type:"add",convoId:t.convoId,author:t.author,targetIds:[h],timestamp:t.timestamp||new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," ")};w.addEntry({type:"group_event",content:b}),eS(t.convoId,b.timestamp),x=!0}}break}case"LEAVE_GROUP":{let v=C.find(e=>e.id===t.convoId),E=v?v.members.indexOf(t.author):-1;if(v&&E>-1){v.members.splice(E,1);let I={type:"leave",convoId:t.convoId,author:t.author,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," ")};w.addEntry({type:"group_event",content:I}),eS(t.convoId,I.timestamp)}break}case"KICK_MEMBER":case"MUTE_MEMBER":case"SET_ADMIN":case"CHANGE_NICKNAME":let $=C.find(e=>e.id===t.convoId);if(!$)break;let L=t.author,S=$.owner===L,D=$.admins&&$.admins.includes(L),M={...t},N=!1,O="";"MUTE_MEMBER"===e?(O="mute",(S||D)&&($.muted||($.muted={}),$.muted[t.targetId]=new Date(new Date().getTime()+6e4*t.duration).toISOString(),N=!0)):"KICK_MEMBER"===e?(O="kick",(S||D)&&($.members=$.members.filter(e=>e!==t.targetId),N=!0)):"SET_ADMIN"===e?(O="set_admin",S&&($.admins||($.admins=[]),$.admins.includes(t.targetId)||$.admins.push(t.targetId),N=!0)):"CHANGE_NICKNAME"===e&&(O="nickname_change",M.oldName=ed(t.targetId,t.convoId),$.nicknames||($.nicknames={}),"user"===t.targetId||"{{user}}"===t.targetId?$.nicknames.user=t.newName:$.nicknames[t.targetId]=t.newName,N=!0),N&&(M.type=O,M.timestamp=new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," "),w.addEntry({type:"group_event",content:M}),eS(t.convoId,M.timestamp));break;case"RENAME_GROUP":{let P=C.find(e=>e.id===t.convoId);if(P||(T&&T.startsWith("convo_group_")&&(P=C.find(e=>e.id===T)),P||console.warn(`[RENAME_GROUP] 无法通过ID ${t.convoId} 找到群聊，尝试宽容处理...`)),!P){console.error(`[RENAME_GROUP] 失败：找不到目标群聊。`);break}P.name=t.newName;let H=new Date(window.currentGameDate),R=t.timestamp?t.timestamp:H.toISOString().substring(0,19),q={type:"rename",convoId:P.id,author:t.author,newName:t.newName,timestamp:R};if(w.addEntry({type:"group_event",content:q}),document.getElementById("wechat-chat-view").classList.contains("active")&&T===P.id&&ek(q),eS(P.id,R),T===P.id){let U=document.getElementById("contact-name-header");U&&(U.textContent=`${t.newName} (${P.members.length})`);let G=document.getElementById("group-settings-name");G&&(G.textContent=t.newName)}el()}break;case"CREATE_GROUP":{let W=t.include_user?["user",...t.members]:[...t.members];W.includes(t.owner)||W.push(t.owner);let j=[...new Set(W)],Y=ap(j);if(C.find(e=>e.id===Y)){let z=C.find(e=>e.id===Y);if(z&&z.name!==t.name){let F={type:"rename",convoId:Y,author:t.owner,newName:t.name,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," ")};w.addEntry({type:"group_event",content:F}),z.name=t.name,eS(Y,F.timestamp)}}else{let V={id:Y,type:"group",name:t.name,owner:t.owner,members:j,admins:[],avatar:"",userIsObserver:!t.include_user,unread:0,pinned:!1,nicknames:{},dissolved:!1},X=new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," ");w.addEntry({type:"group_event",content:{type:"create",author:t.owner,convoId:Y,timestamp:X}}),V.lastActivity=new Date(X.replace(" ","T")).getTime(),C.push(V)}break}case"MUSIC_SHARE":let K={title:t.title||"未知歌曲",artist:t.artist||"未知歌手",cover:"https://files.catbox.moe/g3x1v8.jpg"};w.addEntry({type:"music_share",sender:t.author||k,convoId:t.convoId||T,data:K,timestamp:new Date(window.currentGameDate).toISOString()});break;case"FOOTPRINTS":w.addEntry({type:"footprints",author:t.author,content:t,timestamp:new Date(window.currentGameDate).toISOString()}),document.getElementById("cp-footprints-view").classList.contains("active")&&B===t.author&&t2(t)}}function e4(e,t,a){let n=a.match(/^(convo_vgroup_|convo_group_)(.+)$/),l=a;if(n&&!C.find(e=>e.id===a)){let r=n[2],o=C.find(e=>e.name===r);o&&(l=o.id)}if(l&&l.startsWith("convo_group_")){let s=l.substring(12).split("-");s.sort(),l=`convo_group_${s.join("-")}`}let d=C.find(e=>e.id===l);if(d&&"single"===d.type&&!d.members.includes(t)){console.log(`[BLMX Redirect] Detected message from non-member '${t}' to a single chat. Attempting to redirect...`);let c=d.members.find(e=>e!==t),m=t;if(c&&m){if("user"===c||"{{user}}"===c||"user"===m||"{{user}}"===m){let p="user"===c||"{{user}}"===c?m:c,u=`convo_single_${p}`;console.log(`[BLMX Redirect] Rerouting to SINGLE chat with {{user}}: ${u}`);let g=C.find(e=>e.id===u);if(!g){console.log(`[BLMX Redirect] Creating new single chat: ${u}`);let y={id:u,type:"single",members:["user",p],unread:0,pinned:!1,lastActivity:new Date(window.currentGameDate).getTime()};C.push(y),el(),g=y}l=u,d=g}else{let f=ap([c,m]);console.log(`[BLMX Redirect] Rerouting message from '${m}' to '${c}' into 2-person GROUP chat '${f}'.`);let h=C.find(e=>e.id===f);if(!h){console.log(`[BLMX Redirect] Creating new 2-person group chat: ${f}`);let b=[c,m],v=b.map(e=>ed(e,null)).join(", "),E={id:f,type:"group",name:v,members:b,owner:b[0],admins:[],avatar:"",userIsObserver:!0,unread:0,pinned:!1,lastActivity:new Date(window.currentGameDate).getTime(),dissolved:!1,nicknames:{}};C.push(E),el(),h=E}l=f,d=h}}}if(!d){let I=l.match(/^convo_group_(.+)$/);if(!I||I[1].includes("user")||I[1].includes("{{user}}")){console.warn(`[BLMX ROUTING] AI tried to reply to a non-existent or invalid conversation '${l}'. Ignoring.`);return}{let $=I[1].split("-"),L=$.map(e=>ed(e,null)).join(", "),k={id:l,type:"group",name:L,members:$,owner:$[0],admins:[],avatar:"",userIsObserver:!0,unread:0,pinned:!1,lastActivity:new Date(window.currentGameDate).getTime(),dissolved:!1,nicknames:{}};C.push(k),el(),d=k}}if("vgroup"===d.type);else if(!d.members.includes(t)){console.warn(`[BLMX ROUTING] AI tried to reply as '${t}' to conversation '${l}' where they are not a member. Ignoring.`);return}if(d.muted&&d.muted[t]&&new Date<new Date(d.muted[t]))return;let S=e.match(/^\[邀请:(.*)\]/);if(S)try{let B=JSON.parse(S[1]),{inviter:D,invitee:_}=B;if(d&&"group"===d.type&&D&&_){let M="user"===_||"{{user}}"===_||_===A.name,N=M?d.userIsObserver:!d.members.includes(_);if(N){let O=_;M?(O="user",d.userIsObserver=!1,d.members.includes("user")||d.members.push("user")):d.members.includes(_)||d.members.push(_);let P={type:"add",convoId:l,author:D,targetIds:[O],timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," ")};w.addEntry({type:"group_event",content:P}),el(),x=!0;return}}}catch(H){console.error("解析邀请指令失败:",H,S[1])}let R="消息失败--",q=!1,U=e;e.startsWith(R)&&"single"===d.type&&(q=!0,U=e.substring(R.length).trim());let G={id:`msg-${Date.now()}-${Math.random()}`,sender:t,conversationId:l,type:"message",content:U,isFailed:q},W=e.match(/MUSIC_SHARE:({.*})/),j=e.match(/^\[(表情|sticker):\s*(.*)\]/),Y=e.match(/^\[(图片|image):\s*(.*)\]/),z=e.match(/^\[(语音|voice):\s*({.*})\]/),F=e.match(/^\[(位置|location):\s*(.*)\]/),V=e.match(/^\[(转账|transfer):\s*(.*)\]/),X=e.match(/^\[(文件|file):\s*(.*)\]/),K=e.match(/^\[(礼物|gift):\s*(.*)\]/),J=e.match(/^\[(红包|red_packet):\s*(.*)\]/),Z=e.match(/^\[(转发|forward):\s*(.*)\]/s),Q=!1;if(W){G.type="music_share";try{let ee=JSON.parse(W[1]);G.data=ee,G.content=W[1]}catch(et){console.error("解析 MUSIC_SHARE JSON 失败:",et),G.type="message",G.content=e}}else if(z)G.type="voice",G.content=JSON.parse(z[2]);else if(j)G.type="sticker",G.content=j[2];else if(Y){G.type="image";try{G.content=JSON.parse(Y[2])}catch(ea){G.content={type:"desc",value:Y[2]}}G.content&&"desc"===G.content.type&&G.content.value&&i(G.id,G.content.value,"chat")}else if(F)G.type="location",G.content=F[2];else if(J){Q=!0,G.type="red_packet",G.content=JSON.parse(J[2]);let ei=e6(l,t,G.content.amount);w.addEntry(G),ei.forEach(e=>w.addEntry(e))}else if(V)G.type="transfer",G.data=JSON.parse(V[2]),G.content=V[2];else if(X)G.type="file",G.content=X[2];else if(K)G.type="gift",G.data=JSON.parse(K[2]),G.content=K[2];else if(Z){G.type="forward";let en=Z[2];try{G.data=JSON.parse(en),G.content=en}catch(er){G.type="message",G.content=e,delete G.data}}Q||w.addEntry(G),x=!0;let eo=new Date(window.currentGameDate).toISOString();if(eS(l,eo),(l!==T||!document.getElementById("wechat-chat-view").classList.contains("active"))&&(d.unread||(d.unread=0),d.unread++,!G.isFailed)){let es=d.name,ec=G.content;if("single"===d.type){let ep=d.members.find(e=>"user"!==e);es=ed(ep,d.id)}else{let eu=ed(G.sender,d.id);es=d.name,ec=`${eu}: ${G.content}`}em(d.id,es,ec)}}function e6(e,t,a){let i=C.find(t=>t.id===e);if(!i||"group"!==i.type)return[];let n=i.members.filter(e=>e!==t&&"user"!==e);if(0===n.length)return[];let l=Math.round(100*a),r=[];for(let o=0;o<n.length-1;o++){let s=Math.floor(Math.random()*(l-(n.length-1-o)))+1;r.push(s),l-=s}r.push(l),r.sort(()=>Math.random()-.5);let d={name:"",amount:0};r.forEach((t,a)=>{let i=t/100;i>d.amount&&(d={name:ed(n[a],e),amount:i})});let c=new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," "),m=[];return r.forEach((a,i)=>{let l=ed(n[i],e),r={type:"red_packet_grab",convoId:e,author:t,grabberName:l,amount:a/100,isLuckiest:l===d.name,timestamp:c};m.push({type:"group_event",content:r})}),m}function eX(){let e=""!==m.value.trim(),t=E.length>0,a=document.getElementById("island-text"),i=document.getElementById("observer-poke-btn"),n=document.getElementById("observer-screenshot-btn");p.style.display=e||t||I?"inline-block":"none",u.style.display=e||b?"none":"inline-block",b?(p.disabled=!0,p.innerHTML='<i class="fas fa-spinner fa-spin"></i>',a&&a.classList.add("is-generating"),i&&(i.disabled=!0),n&&(n.disabled=!0)):(p.disabled=!1,p.innerHTML='<i class="fas fa-paper-plane"></i>',a&&a.classList.remove("is-generating"),i&&(i.disabled=!1),n&&(n.disabled=!1))}function e5(e,t){let a=JSON.parse(localStorage.getItem(ei(e))||"[]"),i=[];if(t){let n=C.find(e=>e.id===t);n&&"group"===n.type&&(i=JSON.parse(localStorage.getItem(ei(t))||"[]"))}let l=[...a,...i],r=l.filter((e,t,a)=>t===a.findIndex(t=>t.label===e.label));return r}async function eK(e){if("user"===e){let t=A.avatar||"",a=await showDialog({mode:"prompt",text:"请输入你的新头像URL:",defaultValue:t});null!==a&&(A.avatar=a,document.getElementById("me-view-avatar").src=a)}else{let i=_.find(t=>t.id===e);if(!i)return;let n=i.avatar||"",l=await showDialog({mode:"prompt",text:`请输入 ${ed(i.id,null)} 的新头像URL:`,defaultValue:n});null!==l&&(i.avatar=l)}el(),await showDialog({mode:"alert",text:"头像已更新！"}),T&&e$(T),eB(S),ts()}async function eJ(e,t){if(!e)return;let a=[],i=e.split(",");if(i.forEach(e=>{if(!(e=e.trim()))return;let t=e.match(/https?:\/\/[^\s]+/);if(t){let i=t[0],n=e.substring(0,t.index).trim();n&&i&&a.push({label:n,url:i})}}),a.length>0){let n=JSON.parse(localStorage.getItem(t)||"[]");localStorage.setItem(t,JSON.stringify([...n,...a])),await showDialog({mode:"alert",text:`${a.length} 个表情包已添加！`})}else await showDialog({mode:"alert",text:"未找到有效的表情包格式。请使用 '描述URL, 描述URL' 格式。逗号是英文逗号"})}let eZ={get(){let e=JSON.parse(localStorage.getItem(et)||"[]"),t=[...ea,...e].map(e=>({label:e.label,icon:e.url,isDefault:ea.some(t=>t.label===e.label),action(){e1({type:"sticker",sender:"me",content:e.label}),ta(null)}}));return t.unshift({label:"删除",isAddBtn:!0,action(){ti(g,et,eZ)}}),t.unshift({label:"添加",isAddBtn:!0,async action(){let e=await showDialog({mode:"prompt",text:"批量添加通用表情包 (格式: 描述1URL1,描述2URL2...用英文逗号分隔开):"});await eJ(e,et),tn(g,eZ.get())}}),t}},eQ={get(){if(!T)return[];let e=C.find(e=>e.id===T);if(!e)return[];let t=[],a,i;if("group"===e.type)a=ei(e.id),i=`"${e.name}"`,t=JSON.parse(localStorage.getItem(a)||"[]");else{let n=e.members.find(e=>"user"!==e);a=ei(n),i=`"${ed(n,e.id)}"`,t=JSON.parse(localStorage.getItem(a)||"[]")}let l=t.map(e=>({label:e.label,icon:e.url,isDefault:!1,action(){e1({type:"sticker",sender:"me",content:e.label}),ta(null)}}));return l.unshift({label:"删除",isAddBtn:!0,action(){ti(y,a,eQ)}}),l.unshift({label:"添加",isAddBtn:!0,async action(){let e=await showDialog({mode:"prompt",text:`为 ${i} 批量添加专属表情包 (格式: 描述1URL1,描述2URL2...):`});await eJ(e,a),tn(y,eQ.get())}}),l}},te=[{label:"相册",icon:"fas fa-images",async action(){let e=await showDialog({mode:"prompt",text:"请输入图片描述:"});null!==e&&e&&(e1({type:"image",sender:"me",content:{type:"desc",value:e}}),ta(null))}},{label:"拍摄",icon:"fas fa-camera",async action(){let e=await af({title:"记录事件",fields:[{id:"timestamp",label:"事件发生时间",type:"text",defaultValue:new Date(window.currentGameDate).toISOString().slice(0,16).replace("T"," ")},{id:"description",label:"事件描述 (可选)",type:"textarea"}]});if(null===e)return;let{timestamp:t,description:a}=e;if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(t.trim())){await showDialog({mode:"alert",text:"时间格式不正确，应为 YYYY-MM-DD HH:mm"});return}window.currentGameDate=new Date(t);let i={convoId:T,timestamp:t,description:a||""};w.addEntry({type:"event_log",content:i}),e8(i,w.logEntries.length-1),w.persistLogToStorage(),ta(null)}},{label:"视频通话",icon:"fas fa-video",async action(){if("idle"!==P){await showDialog({mode:"alert",text:"当前正在通话中或呼叫中。"});return}let e=C.find(e=>e.id===T);if(!e||"single"!==e.type){await showDialog({mode:"alert",text:"只能在和单个联系人的聊天中发起视频通话。"});return}let t=e.members.find(e=>"user"!==e),a=_.find(e=>e.id===t);if(!a)return;let i=await showDialog({mode:"confirm",text:`确定要向 ${ed(a.id,T)} 发起视频通话吗？`});if(!i)return;document.getElementById("chat-simulation-log").innerHTML="",P="calling",q={id:a.id,name:ed(a.id,T),avatar:ec(a.id)};let n=document.getElementById("calling-screen");n.querySelector(".caller-avatar").src=q.avatar,n.querySelector(".caller-name").textContent=q.name,eg("calling-screen"),ta(null),setTimeout(()=>{if("calling"===P){P="in-call";let e=document.getElementById("in-call-screen"),t=e.querySelector("#call-shared-screen");e.style.backgroundImage=`url('${q.avatar}')`,e.querySelector(".caller-name").textContent=q.name,t.innerHTML="",t.style.display="none",eg("in-call-screen"),eb()}},1e3*Math.random()+3e3)}},{label:"位置",icon:"fas fa-map-marker-alt",async action(){let e=await showDialog({mode:"prompt",text:"请输入位置:"});null!==e&&e&&(e1({type:"location",sender:"me",content:e}),ta(null))}},{label:"红包",icon:"fas fa-envelope-open-text",action:()=>ta("char-sticker")},{label:"转账",icon:"fas fa-exchange-alt",async action(){let e=await af({title:"发起转账",fields:[{id:"amount",label:"转账金额 (元)",type:"text"},{id:"note",label:"备注 (可选)",type:"text"}]});if(null===e)return;let{amount:t,note:a}=e,i=parseFloat(t);if(!isNaN(i)&&i>0){let n={amount:i.toFixed(2),note:a||" ",status:"sent"},l=C.find(e=>e.id===T);if(l&&"group"===l.type)a$("transfer",n);else{let r=l.members.find(e=>"user"!==e);n.recipientId=r,e1({type:"transfer",sender:"me",data:n}),ta(null)}}else await showDialog({mode:"alert",text:"请输入有效金额"})}},{label:"文件",icon:"fas fa-file-alt",async action(){let e=await showDialog({mode:"prompt",text:"请输入文件名:"});null!==e&&e&&(e1({type:"file",sender:"me",content:e}),ta(null))}},{label:"礼物",icon:"fas fa-gift",async action(){let e=await af({title:"赠送礼物",fields:[{id:"name",label:"礼物名称",type:"text"},{id:"price",label:"价格 (可选)",type:"text"}]});if(null===e)return;let{name:t,price:a}=e;if(t.trim()){let i={name:t,price:a||"",status:"sent"},n=C.find(e=>e.id===T);if(n&&"group"===n.type)a$("gift",i);else{let l=n.members.find(e=>"user"!==e);i.recipientId=l,e1({type:"gift",sender:"me",data:i}),ta(null)}}else await showDialog({mode:"alert",text:"礼物名称不能为空。"})}},],tt=[{label:"群红包",icon:"fas fa-wallet",async action(){let e=C.find(e=>e.id===T);if(!e||"group"!==e.type){await showDialog({mode:"alert",text:"只能在群聊中发群红包。"});return}let t=await af({title:"发送群红包",fields:[{id:"title",label:"祝福语",type:"text",defaultValue:"恭喜发财，大吉大利"},{id:"amount",label:"总金额 (元)",type:"text"},{id:"timestamp",label:"发送时间",type:"text",defaultValue:new Date(window.currentGameDate).toISOString().slice(0,16).replace("T"," ")}]});if(null===t)return;let{title:a,amount:i,timestamp:n}=t,l=parseFloat(i);if(isNaN(l)||l<=0){await showDialog({mode:"alert",text:"请输入有效的金额。"});return}if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(n.trim())){await showDialog({mode:"alert",text:"时间格式不正确，应为 YYYY-MM-DD HH:mm"});return}let r={title:a||"恭喜发财，大吉大利",amount:l,senderId:A.id,timestamp:n.trim()},o={type:"red_packet",sender:"user",content:r,conversationId:e.id,id:`msg-pending-${Date.now()}`},s=e6(e.id,"user",l);w.addEntry(o),s.forEach(e=>w.addEntry(e)),await w.persistLogToStorage(),e$(T),ta(null)}},{label:"转发",icon:"fas fa-share-alt",action(){document.getElementById("wechat-chat-view").classList.add("forward-mode"),document.querySelector(".wechat-input-area").style.display="none",document.getElementById("observer-mode-footer").style.display="none",document.getElementById("forward-action-bar").style.display="flex",ta(null)}},{label:"长截图",icon:"fas fa-camera-retro",action(){aS(),ta(null)}},];function ta(e){let t=document.getElementById("panel-container"),a=document.querySelector(".panel-view.active"),i=t.classList.contains("active");i&&a&&a.id.startsWith(e)?(t.classList.remove("active"),a.classList.remove("active")):e?("char-sticker"===e&&tn(y,eQ.get()),a&&a.classList.remove("active"),document.getElementById(`${e}-panel`).classList.add("active"),i||t.classList.add("active")):(i&&t.classList.remove("active"),a&&a.classList.remove("active"))}async function ti(e,t,a){let i=e.closest(".panel-view"),n=e.classList.contains("sticker-delete-mode"),l=i.querySelector(".delete-confirm-bar");if(l&&l.remove(),n)e.classList.remove("sticker-delete-mode"),i.classList.remove("delete-mode-active"),tn(e,a.get());else{e.classList.add("sticker-delete-mode"),i.classList.add("delete-mode-active"),tn(e,a.get());let r=document.createElement("div");r.className="delete-confirm-bar",r.style.cssText="padding: 0.75rem; background: rgba(247,247,247,0.95); display: flex; justify-content: center; align-items: center; gap: 1rem; border-top: 1px solid #E2E2E2;";let o=document.createElement("button");o.textContent="确认删除选中项",o.style.cssText="padding: 0.5rem 1rem; border: none; border-radius: 0.3125rem; background-color: #E53935; color: white; cursor: pointer; font-size: 0.9em;";let s=document.createElement("button");s.textContent="取消",s.style.cssText="padding: 0.5rem 1rem; border: none; border-radius: 0.3125rem; background-color: #757575; color: white; cursor: pointer; font-size: 0.9em;",r.appendChild(s),r.appendChild(o),i.appendChild(r),s.onclick=()=>{ti(e,t,a)},o.onclick=async()=>{let i=[];if(e.querySelectorAll(".sticker-checkbox:checked").forEach(e=>{i.push(e.dataset.stickerLabel)}),0===i.length){await showDialog({mode:"alert",text:"请至少选择一个要删除的表情包。"});return}let n=await showDialog({mode:"confirm",text:`确定要删除选中的 ${i.length} 个表情包吗？`});if(n){let l=JSON.parse(localStorage.getItem(t)||"[]"),r=l.filter(e=>!i.includes(e.label));localStorage.setItem(t,JSON.stringify(r)),await showDialog({mode:"alert",text:"删除成功！"}),ti(e,t,a)}}}}function tn(e,t){e.innerHTML="";let a=e.classList.contains("sticker-delete-mode");t.forEach(t=>{let i=document.createElement("div");i.className="feature-item";let n;if(n=t.isAddBtn?`<div class="feature-icon"><i class="fas fa-${"添加"===t.label?"plus":"trash-alt"}"></i></div>`:t.icon.startsWith("fas ")?`<div class="feature-icon"><i class="${t.icon}"></i></div>`:`<div class="feature-icon"><img src="${t.icon}" alt="${t.label}"></div>`,i.innerHTML=`${n}<span class="feature-label">${t.label}</span>`,a&&!t.isAddBtn){let l=document.createElement("input");l.type="checkbox",l.className="sticker-checkbox",l.dataset.stickerLabel=t.label,i.appendChild(l),i.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),l.checked=!l.checked})}else i.addEventListener("click",t.action);e.appendChild(i)})}async function tl(e,t){let a=await showDialog({mode:"prompt",text:e,defaultValue:t.replace(" ","T")});return null===a?null:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(a)?a:(await showDialog({mode:"alert",text:"格式错误，请输入 YYYY-MM-DDTHH:mm 格式。"}),null)}function tr(){let e=C.find(e=>e.id===T),t=document.querySelector("#wechat-chat-view .wechat-body");var a,i,n="";e&&e.wallpaper?(a=t,i=e.wallpaper,i?(a.style.backgroundImage=`url("${i}")`,a.style.backgroundColor="transparent"):(a.style.backgroundImage="none",a.style.backgroundColor="var(--wechat-bg)")):t.style.backgroundImage=""}function to(e,t=!1){return async function(a){a.preventDefault();let i="",n=null;if(t){n=a.currentTarget.dataset.convoId;let l=C.find(e=>e.id===n);if(!l)return;i=l.wallpaper||""}else i=localStorage.getItem(e)||"";let r=await showDialog({mode:"prompt",text:"请输入壁纸的URL链接 (留空则恢复默认):",defaultValue:i});if(null!==r){if(""===r.trim()){if(t){let o=C.find(e=>e.id===n);delete o.wallpaper}else localStorage.removeItem(e);await showDialog({mode:"alert",text:"壁纸已恢复默认。"})}else try{if(new URL(r),t){let s=C.find(e=>e.id===n);s.wallpaper=r}else localStorage.setItem(e,r);await showDialog({mode:"alert",text:"壁纸已更新！"})}catch(d){await showDialog({mode:"alert",text:"请输入一个有效的URL。"})}el(),tr()}}}function ts(){let e=document.getElementById("conversation-list");e.innerHTML="",C.find(e=>"moments_feed"===e.id)||C.unshift({id:"moments_feed",type:"system",name:"朋友圈",members:[],unread:0,lastActivity:0,pinned:!1});let t=new Map,a=[...w.logEntries,...E];a.forEach(e=>{let a=e.conversationId||e.convoId||e.content&&e.content.convoId||e.data&&e.data.convoId;a&&(e.type||e.key)&&!["time"].includes(e.type)&&t.set(a,e)});let i=[...C].sort((e,t)=>{let a=e.pinned||!1,i=t.pinned||!1;return a!==i?a?-1:1:(t.lastActivity||0)-(e.lastActivity||0)});if(1===i.length&&"moments_feed"===i[0].id){e.innerHTML='<p style="text-align:center; color:#999; margin-top: 2rem;">还没有聊天，快去添加朋友吧！</p>';return}i.forEach(a=>{if(a.dissolved&&!a.archived)return;let i=document.createElement("div");i.className="conversation-item",i.dataset.conversationId=a.id,a.pinned&&i.classList.add("pinned");let n,l;if("moments_feed"===a.id)n=A.cover||"https://files.catbox.moe/bialj8.jpeg",l="朋友圈";else if("group"===a.type)n=a.avatar||"https://files.catbox.moe/bialj8.jpeg",l=`${a.name} (${a.members.length})`,a.dissolved&&(l+=" (已解散)");else if("vgroup"===a.type)n=a.avatar||"https://files.catbox.moe/g3x1v8.jpg",l=a.name;else{let r=a.members.find(e=>"user"!==e);r?(n=ec(r),l=ed(r,a.id)):(n="https://files.catbox.moe/bialj8.jpeg",l="未知对话")}let o="",s=t.get(a.id);if("moments_feed"===a.id){let d=[...w.logEntries].reverse().find(e=>{if("CHAR_COMMENT"===e.key&&"user"!==e.data.author){let t=w.logEntries.map((e,t)=>({...e,originalIndex:t})).filter(e=>"MOMENT"===e.key),a=t.find(t=>t.data.momentId===e.data.target_post_id);return a&&("user"===a.data.author||"{{user}}"===a.data.author)}return!1}),c=[...w.logEntries].reverse().find(e=>"MOMENT"===e.key&&"user"!==e.data.author);if(d){let m=ed(d.data.author,null);o=`[${m}] 评论了你的动态`}else o=c?`[${ed(c.data.author,null)}] 发布了新动态`:"还没有新动态"}else if(s){let p=s.sender||(s.data?s.data.author:""),u=ed(p,a.id),g="user"===p||"{{user}}"===p?"你: ":"group"===a.type||"vgroup"===a.type?`${u}: `:"";switch(s.type||s.key){case"message":o=g+s.content;break;case"forward":o=g+`[${s.data.title||"聊天记录"}]`;break;case"group_event":o=`[系统消息] ${eL(s.content)}`;break;case"event_log":o=`[系统消息]`;break;case"image":o=g+"[图片]";break;case"voice":o=g+"[语音]";break;case"red_packet":o=g+"[红包] "+s.content.title;break;default:o=g+`[${s.type||s.key}]`}}let y=a.lastActivity?new Date(a.lastActivity):null,f=y?eT(y.toISOString().replace("T"," ")):"",h=a.unread||0;i.innerHTML=`
			<div class="convo-avatar-container">
				<img src="${n}" class="convo-avatar">
				${h>0?`<div class="unread-badge">${h}</div>`:""}
			</div>
			<div class="convo-details">
				<div class="convo-top-line">
					<div class="convo-name">${l}</div>
					<div class="convo-time">${f}</div>
				</div>
				<div class="convo-last-message">${o.substring(0,30)}</div>
			</div>
		`,i.addEventListener("click",()=>{ep("wechatChat",{conversationId:a.id})}),ex(i,e=>{tm(a.id,e)}),e.appendChild(i)})}function td(){let e=document.getElementById("contacts-list-container");if(e.innerHTML="",0===_.length){e.innerHTML='<p style="text-align:center; color:#999; margin-top: 2rem;">通讯录是空的，快去添加朋友吧！</p>';return}let t=[..._].sort((e,t)=>{let a=ed(e.id,null),i=ed(t.id,null);return a.localeCompare(i,"zh-Hans-CN",{sensitivity:"accent"})});t.reduce((e,t)=>(e["#"]||(e["#"]=[]),e["#"].push(t),e),{});let a=document.createElement("ul");a.style.listStyle="none",a.style.margin="0",a.style.padding="0",t.forEach(e=>{let t=document.createElement("li");t.className="conversation-item",t.dataset.contactId=e.id,t.innerHTML=`
						<div class="convo-avatar-container">
							<img src="${ec(e.id)}" class="convo-avatar">
						</div>
						<div class="convo-details" style="display: flex; align-items: center;">
							<div class="convo-name">${ed(e.id,null)}</div>
						</div>
					`,a.appendChild(t)}),e.appendChild(a)}function tc(){let e=C.reduce((e,t)=>e+(t.unread||0),0),t=document.getElementById("wechat-app-badge");e>0?(t.textContent=e>99?"99+":e,t.style.display="flex"):t.style.display="none"}async function tm(e,t){let a=document.querySelector(".context-menu");a&&a.remove();let i=document.querySelector(".context-menu-backdrop");i&&i.remove();let n=C.find(t=>t.id===e);if(!n)return;let l=document.createElement("div");l.className="context-menu";let r="";if("moments_feed"!==n.id){let o=n.pinned?"取消置顶":"置顶消息";r+=`<div class="context-menu-item" data-action="pin"style="color: var(--text-color-secondary);">${o}</div>`}r+=`<div class="context-menu-item" data-action="read"style="color: var(--text-color-secondary);">标为已读</div>`,(n.userIsObserver||"system"!==n.type)&&(r+=`<div class="context-menu-item" data-action="delete" style="color:red;">删除此聊天</div>`),l.innerHTML=r;let s=document.createElement("div");s.className="context-menu-backdrop",document.body.appendChild(s),document.body.appendChild(l);let d=t.type.includes("touch")?t.touches[0].clientX:t.clientX,c=t.type.includes("touch")?t.touches[0].clientY:t.clientY;l.style.left=`${d}px`,l.style.top=`${c}px`;let m=()=>{l.remove(),s.remove()};s.addEventListener("click",m),l.addEventListener("click",async t=>{let a=t.target.dataset.action;if("pin"===a)n.pinned=!n.pinned;else if("read"===a)n.unread=0;else if("delete"===a){let i=await showDialog({mode:"confirm",text:"确定要删除这个聊天吗？\n此操作不可恢复。"});if(i){let l=C.findIndex(t=>t.id===e);l>-1&&C.splice(l,1),w.logEntries=w.logEntries.filter(t=>(t.conversationId||t.convoId||t.content&&t.content.convoId||t.data&&t.data.convoId)!==e),await w.persistLogToStorage()}}el(),ts(),tc(),m()})}async function tp(e,t,a){let i=document.querySelector(".context-menu");i&&i.remove();let n=document.querySelector(".context-menu-backdrop");n&&n.remove();let l=C.find(e=>e.id===t);if(!l)return;let r="user",o=document.createElement("div");o.className="context-menu";let s="",d=l.owner===r,c=l.admins&&l.admins.includes(r),m=l.owner===e,p=l.admins&&l.admins.includes(e),u=l.muted&&l.muted[e]&&new Date<new Date(l.muted[e]);if(s+=`<div class="context-menu-item" data-action="nickname">修改群昵称</div>`,(d||c)&&!m&&!(c&&p&&!d)&&(u?s+=`<div class="context-menu-item" data-action="unmute">解除禁言</div>`:s+=`<div class="context-menu-item" data-action="mute">禁言</div>`),d&&!m&&(p?s+=`<div class="context-menu-item" data-action="unset_admin">取消管理员</div>`:s+=`<div class="context-menu-item" data-action="set_admin">设为管理员</div>`),(d||c)&&!m&&!(c&&p&&!d)&&(s+=`<div class="context-menu-item" data-action="kick" style="color:red;">移出群聊</div>`),o.innerHTML=s,!o.hasChildNodes())return;let g=document.createElement("div");g.className="context-menu-backdrop",document.body.appendChild(g),document.body.appendChild(o);let y=a.type.includes("touch")?a.touches[0].clientX:a.clientX,f=a.type.includes("touch")?a.touches[0].clientY:a.clientY;o.style.left=`${y}px`,o.style.top=`${f}px`;let h=()=>{o.remove(),g.remove()};g.addEventListener("click",h),o.addEventListener("click",async a=>{let i=a.target.dataset.action;if(!i)return;h();let n=new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," "),o={convoId:t,author:r,targetId:e,timestamp:n},s=!1;switch(i){case"nickname":{let d=ed(e,t),c=await showDialog({mode:"prompt",text:`为 "${d}" 设置群昵称:`,defaultValue:d});null!==c&&(l.nicknames||(l.nicknames={}),l.nicknames[e]=c.trim(),o.type="nickname_change",o.oldName=d,o.newName=c.trim(),s=!0);break}case"mute":{let m=await showDialog({mode:"prompt",text:"输入禁言时长（分钟）:",defaultValue:"10"}),p=parseInt(m,10);!isNaN(p)&&p>0?(l.muted||(l.muted={}),l.muted[e]=new Date(new Date(n.replace(" ","T")).getTime()+6e4*p).toISOString(),o.type="mute",o.duration=p,s=!0):null!==m&&await showDialog({mode:"alert",text:"请输入有效的禁言时长。"});break}case"unmute":delete l.muted[e],o.type="unmute",s=!0;break;case"set_admin":l.admins||(l.admins=[]),l.admins.includes(e)||l.admins.push(e),o.type="set_admin",s=!0;break;case"unset_admin":l.admins=l.admins.filter(t=>t!==e),o.type="unset_admin",s=!0;break;case"kick":{let u=await showDialog({mode:"confirm",text:`确定要将 "${ed(e,t)}" 移出群聊吗？`});u&&(l.members=l.members.filter(t=>t!==e),o.type="kick",s=!0)}}s&&(w.addEntry({type:"group_event",content:o}),await w.persistLogToStorage(),el(),ep("groupSettings",{conversationId:t}))})}async function tu(){let e=await showDialog({mode:"confirm",text:"【软重置】\n确定要清空所有聊天记录、朋友圈、微博、日记以及查手机记录吗？\n\n此操作不可撤销，但会保留您的联系人和设置。"});if(e){w.logEntries=[],O={posts:[],comments:{},likes:{}},await w.persistLogToStorage(),C.forEach(e=>{e.unread=0,e.lastActivity=0}),el(),Object.keys(localStorage).forEach(e=>{(e.startsWith("blmx_footprints_")||e.startsWith("blmx_shopping_")||e.startsWith("blmx_browser_")||e.startsWith("blmx_gallery_"))&&(localStorage.removeItem(e),console.log(`[Soft Reset] Cleared cache: ${e}`))}),ts(),tc();let t=document.getElementById("cp-footprints-list");t&&(t.innerHTML=""),await showDialog({mode:"alert",text:"软重置完成！所有动态数据已被清空。"}),ep("home")}}async function tg(){let e=await showDialog({mode:"confirm",text:"【硬重置 - 警告！】\n确定要将手机恢复到出厂设置吗？\n\n此操作将删除所有聊天记录、联系人、群聊、设置、壁纸等全部数据，且不可恢复！"});if(e){await showDialog({mode:"alert",text:"正在清除所有数据..."}),w.logEntries=[],await w.persistLogToStorage();let t=[];for(let a=0;a<localStorage.length;a++){let i=localStorage.key(a);i.startsWith("blmx_")&&t.push(i)}t.forEach(e=>{localStorage.removeItem(e),console.log(`[Hard Reset] Removed: ${e}`)}),await showDialog({mode:"alert",text:"数据已全部清除。手机即将重启。"}),location.reload()}}async function ty(e,t){if(b)return;console.log(`[AI Moments] 正在为朋友圈 ${e} 的互动触发AI响应...`),b=!0,eX();let a=function e(t,a){let i=w.logEntries.find(e=>"MOMENT"===e.key&&e.data.momentId===t);if(!i)return console.error(`[AI Moments] 无法创建上下文，未找到ID为 ${t} 的朋友圈。`),null;let n=i.data,l=ed(n.author,null),r=`[任务: 朋友圈互动导演]
你正在扮演除 {{user}} 之外的所有角色。你的任务是根据上下文，自然地推进评论区的对话。

`;r+=`--- 朋友圈原文 ---
`,r+=`发布者: ${l}
`,r+=`内容: ${n.text||"(无文字内容)"}

`;let o=w.logEntries.filter(e=>"CHAR_COMMENT"===e.key&&e.data.target_post_id===t);return o.length>0&&(r+=`--- 已有互动 ---
`,o.forEach(e=>{let t=ed(e.data.author,null);r+=`${t} 评论: ${e.data.text}
`}),r+=`
`),r+=`--- 最新互动 ---
`,a?r+=`{{user}} 刚刚评论说: "${a}"

`:r+=`{{user}} 刚刚点赞了这条动态。

`,r+=`--- 你的任务 ---
让一两个角色对**最新的互动**（无论是来自{{user}}还是其他角色）做出回应。你的回应必须符合角色人设。

`,r+=`【评论格式新规 (CRITICAL)】
`,r+=`1. **禁止引用**: 朋友圈评论中，绝对禁止使用 \`[引用:"..."]\` 格式。
`,r+=`2. **回复他人**: 如果你想回复评论区的某个人（非作者），请使用 \`@对方名字:\` 的格式开头。
`,r+=` * 示例: \`@李四: 我同意你的看法。\`
`,r+=`3. **回复作者/普通评论**: 如果你是回复作者，或者只是发表普通评论，直接写内容即可。
`,r+=` * 示例: \`这条动态太有意思了。\`

`,r+=`[输出格式]
你的回复必须严格使用以下指令格式，每条指令占一行，不要包含任何其他文字：
`,r+=`CHAR_COMMENT:{"author":"角色ID","text":"评论内容","target_post_id":"${t}"}`}(e,t);if(!a){b=!1,eX();return}N=a;try{let i=await v({user_input:a,should_stream:!1});(M=i.trim())&&await ao(M)}catch(n){console.error(`[AI Moments] AI响应失败:`,n),await showDialog({mode:"alert",text:`AI响应朋友圈失败: ${n.message}`})}finally{b=!1,eX()}}async function tf(e){let t=await showDialog({mode:"confirm",text:"确定要删除这条朋友圈吗？\n此操作将同时删除所有相关的点赞和评论，且不可恢复。"});t&&(w.logEntries=w.logEntries.filter(t=>("MOMENT"!==t.key||t.data.momentId!==e)&&("CHAR_LIKE"!==t.key&&"CHAR_COMMENT"!==t.key||t.data.target_post_id!==e)),await w.persistLogToStorage(),eB(S),await showDialog({mode:"alert",text:"动态已删除。"}))}async function th(e){let t=_.find(t=>t.id===e);if(!t){console.error(`[Block Contact] Action failed: Cannot find contact with id: ${e}`);return}let a=t.isBlocked||!1,i=a?`确定要将 "${ed(t.id,null)}" 从黑名单中移除吗？`:`确定要将 "${ed(t.id,null)}" 加入黑名单吗？`,n=await showDialog({mode:"confirm",text:i});if(n){let l=t.isBlocked;t.isBlocked=!a,el(),ew(e),!l&&t.isBlocked&&(await showDialog({mode:"alert",text:`正在通知 ${ed(t.id,null)}...`}),await tb(e)),await showDialog({mode:"alert",text:`已成功${a?"解除拉黑":"加入黑名单"}。`})}}async function tb(e){if(b)return;let t=_.find(t=>t.id===e);if(!t)return;let a=`[SYSTEM NOTIFICATION: YOU HAVE BEEN BLOCKED]
You are roleplaying as ${ed(t.id,null)} (ID: ${t.id}).
You have just been blocked by {{user}}.
You are now compelled to react to this event.

**Your Action:**
You MUST respond with one or more messages directed at {{user}}.
Each message MUST start with the prefix "消息失败--".
This prefix indicates that your message was sent but failed to deliver because you are blocked.

**Example Response:**
[convo_single_${t.id}] ${t.id}: 消息失败--你把我拉黑了？
[convo_single_${t.id}] ${t.id}: 消息失败--胆子不小。

Your response should only be the action messages. Do not add any other text. Please begin your response now.`;b=!0,eX(),N=a;try{let i=await v({user_input:a,should_stream:!1});if(M=i.trim()){let n=M.split("\n").filter(e=>e.trim()),l=/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/;for(let r of n){let o=r.match(l);if(o){let s=o[1],c=o[2].trim(),m=o[3];e4(m,c,s)}}d.wechatChat.classList.contains("active")&&e$(T),ts(),tc(),await w.persistLogToStorage(),el()}}catch(p){console.error("[BLMX Notify AI] Failed to notify AI of block:",p),await showDialog({mode:"alert",text:"通知AI失败，详情请查看控制台。"})}finally{b=!1,eX()}}function tv(e){let t=e.target,a=document.querySelector('input[name="bubble-target"]:checked').value,i=e=>{let t=document.querySelector(`[data-variable="${e}"]`);return t?"checkbox"===t.type?t.checked:t.value:null},n=()=>{let e=a,t=document.documentElement,n=document.querySelector('input[name="bg-type"]:checked').value,l,r=i("bg-image-url"),o=i("bg-color-1"),s=i("bg-color-2"),d=i("bg-gradient-angle");t.style.setProperty(`--bubble-${e}-bg-mode`,n),t.style.setProperty(`--bubble-${e}-bg-url`,r),t.style.setProperty(`--bubble-${e}-backdrop-blur`,i("backdrop-blur")+"px");let c=i("wiggle-scale");t.style.setProperty(`--bubble-${e}-wiggle-scale`,c);let m=document.getElementById(`wiggle-map-${e}`);if(m&&m.setAttribute("scale",c),"image"===n){let p=r?`url('${r}') center center / cover no-repeat`:"none";l=`${p}, transparent`,t.style.setProperty(`--bubble-${e}-bg-image`,r?`url('${r}')`:"none"),t.style.setProperty(`--bubble-${e}-bg-color`,"transparent")}else{let u=o===s?o:`linear-gradient(${d}deg, ${o}, ${s})`;l=`none, ${u}`,t.style.setProperty(`--bubble-${e}-bg-image`,"none"),t.style.setProperty(`--bubble-${e}-bg-color`,u)}t.style.setProperty(`--bubble-${e}-background`,l),t.style.setProperty(`--bubble-${e}-border-top-left-radius`,i("border-top-left-radius")+"px"),t.style.setProperty(`--bubble-${e}-border-top-right-radius`,i("border-top-right-radius")+"px"),t.style.setProperty(`--bubble-${e}-border-bottom-right-radius`,i("border-bottom-right-radius")+"px"),t.style.setProperty(`--bubble-${e}-border-bottom-left-radius`,i("border-bottom-left-radius")+"px"),t.style.setProperty(`--bubble-${e}-text-color`,i("text-color")),t.style.setProperty(`--bubble-${e}-font-size`,i("font-size")+"px"),t.style.setProperty(`--bubble-${e}-font-weight`,i("font-weight")),t.style.setProperty(`--bubble-${e}-border-width`,i("border-width")+"px"),t.style.setProperty(`--bubble-${e}-border-style`,i("border-style")),t.style.setProperty(`--bubble-${e}-border-color`,i("border-color"));let g=`${i("shadow-inset")?"inset":""} ${i("shadow-offset-x")}px ${i("shadow-offset-y")}px ${i("shadow-blur")}px ${i("shadow-spread")}px ${i("shadow-color")}`.trim();t.style.setProperty(`--bubble-${e}-box-shadow`,g),t.style.setProperty(`--bubble-${e}-padding-top`,i("padding-vertical")+"px"),t.style.setProperty(`--bubble-${e}-padding-bottom`,i("padding-vertical")+"px"),t.style.setProperty(`--bubble-${e}-padding-left`,i("padding-horizontal")+"px"),t.style.setProperty(`--bubble-${e}-padding-right`,i("padding-horizontal")+"px"),t.style.setProperty(`--bubble-${e}-margin-top`,i("margin-vertical")+"px"),t.style.setProperty(`--bubble-${e}-margin-bottom`,i("margin-vertical")+"px"),t.style.setProperty(`--bubble-${e}-margin-left`,i("margin-horizontal")+"px"),t.style.setProperty(`--bubble-${e}-margin-right`,i("margin-horizontal")+"px"),["deco-1","deco-2"].forEach(a=>{let n=a.split("-")[1],l=document.querySelector(`input[name="deco-${n}-type"]:checked`),r=l?l.value:"image",o=document.getElementById(`deco-${n}-image-group`),s=document.getElementById(`deco-${n}-text-group`);o&&s&&(o.style.display="image"===r?"block":"none",s.style.display="text"===r?"block":"none");let d=document.querySelector(`[data-variable="${a}-url"]`),c=document.querySelector(`[data-variable="${a}-content"]`),m=`--bubble-${e}-${a}-url`,p=`--bubble-${e}-${a}-content`;if("image"===r){let u=d?d.value.trim():"";t.style.setProperty(m,u?`url('${u}')`:"none"),t.style.setProperty(p,'""')}else{t.style.setProperty(m,"none");let g=c?c.value:"";t.style.setProperty(p,`"${g}"`)}let y=i(`${a}-rotate`);t.style.setProperty(`--bubble-${e}-${a}-rotate`,`${y}deg`);let f=i(`${a}-font-size`);t.style.setProperty(`--bubble-${e}-${a}-font-size`,`${f}px`);let h=i(`${a}-color`);t.style.setProperty(`--bubble-${e}-${a}-color`,h),["width","height"].forEach(n=>{let l=`--bubble-${e}-${a}-${n}`,r=i(`${a}-${n}`),o=document.querySelector(`[data-variable="${a}-${n}"]`);if(o){let s=o.dataset.unit||"";t.style.setProperty(l,`${r}${s}`)}});let b=i("wiggle-scale");t.style.setProperty(`--bubble-${e}-wiggle-scale`,b);let v=document.getElementById(`wiggle-map-${e}`);v&&v.setAttribute("scale",b),["top","right","bottom","left"].forEach(n=>{let l=`--bubble-${e}-${a}-${n}`,r=i(`${a}-${n}`);t.style.setProperty(l,r)})})};if("range"===t.type&&t.nextElementSibling){let l=t.dataset.unit||"";t.nextElementSibling.textContent=`${t.value}${l}`}if("color"===t.type||t.classList.contains("hex-input")&&"bg-image-url"!==t.dataset.variable){let r=t.closest(".control-wrapper");if(r){let o=r.querySelector(".hex-input"),s=r.querySelector('input[type="color"]'),d=r.querySelector(".color-preview");o&&(o.value=t.value),s&&(s.value=t.value),d&&(d.style.backgroundColor=t.value)}}if("bg-type"===t.name&&(document.getElementById("bubble-bg-color-controls").style.display="color"===t.value?"block":"none",document.getElementById("bubble-bg-image-controls").style.display="image"===t.value?"block":"none"),n(),"border-radius-all"===t.dataset.variable){let c=t.value;["border-top-left-radius","border-top-right-radius","border-bottom-right-radius","border-bottom-left-radius"].forEach(e=>{let t=document.querySelector(`[data-variable="${e}"]`);t&&(t.value=c,t.nextElementSibling&&(t.nextElementSibling.textContent=`${c}px`))}),n()}}function tw(e){let t={},a=getComputedStyle(document.documentElement);return["background","bg-image","bg-image-size","bg-image-repeat","border-top-left-radius","border-top-right-radius","border-bottom-right-radius","border-bottom-left-radius","text-color","font-size","font-weight","font-family","border-width","border-style","border-color","box-shadow","padding-top","padding-right","padding-bottom","padding-left","margin-top","margin-right","margin-bottom","margin-left","wiggle-scale"].forEach(i=>{let n=`--bubble-${e}-${i}`,l=a.getPropertyValue(n).trim();l&&(t[n]=l)}),t}function tE(e,t){let a=Object.keys(e)[0].includes("-me-")?"me":"them";for(let i in e){let n=e[i],l=i.replace(`--bubble-${a}-`,`--bubble-${t}-`);document.documentElement.style.setProperty(l,n)}}function tI(){let e=document.querySelector('input[name="bubble-target"]:checked').value,t=document.getElementById("bubble-controls-container");if(!t)return;let a=t.querySelectorAll("[data-variable]"),i=getComputedStyle(document.documentElement),n=(e,a)=>{let i=t.querySelector(`[data-variable="${e}"]`);i&&(i.value=a,i.nextElementSibling&&(i.nextElementSibling.textContent=`${a}${i.dataset.unit||""}`))},l=(e,t)=>{if(e.includes("shadow"))return;let a=document.querySelector(`.hex-input[data-variable="${e}"]`),i=document.querySelector(`input[type="color"][data-variable="${e}"]`);a&&(a.value=t),i&&(i.value=t),i&&i.nextElementSibling&&(i.nextElementSibling.style.backgroundColor=t)},r=i.getPropertyValue(`--bubble-${e}-bg-mode`).trim(),o=i.getPropertyValue(`--bubble-${e}-bg-url`).trim();(o.startsWith('"')&&o.endsWith('"')||o.startsWith("'")&&o.endsWith("'"))&&(o=o.slice(1,-1));let s=document.getElementById("bg-type-color"),d=document.getElementById("bg-type-image"),c=document.querySelector('[data-variable="bg-image-url"]');if("image"===r)d.checked=!0,document.getElementById("bubble-bg-color-controls").style.display="none",document.getElementById("bubble-bg-image-controls").style.display="block",c&&(c.value=o);else{s.checked=!0,document.getElementById("bubble-bg-color-controls").style.display="block",document.getElementById("bubble-bg-image-controls").style.display="none";let m=i.getPropertyValue(`--bubble-${e}-background`).trim(),p=m.match(/linear-gradient\((.*?)deg,\s*(.*?),\s*(.*?)\)/);if(p)n("bg-gradient-angle",parseFloat(p[1])||0),l("bg-color-1",p[2].trim()),l("bg-color-2",p[3].trim());else if(m){let u=m.split(",").pop().trim();u&&!u.includes("url")&&(l("bg-color-1",u),l("bg-color-2",u))}}let g=parseFloat(i.getPropertyValue(`--bubble-${e}-backdrop-blur`).trim())||0;n("backdrop-blur",g),a.forEach(t=>{let a=t.dataset.variable;if(a.includes("padding-")||a.includes("margin-")||a.includes("shadow-")||a.includes("bg-")||a.includes("border-radius")||a.includes("deco-")||"backdrop-blur"===a)return;let r=`--bubble-${e}-${a}`,o=i.getPropertyValue(r).trim();"range"===t.type?n(a,parseFloat(o)||0):"color"===t.type?l(a,o):t.value=o}),n("border-top-left-radius",parseFloat(i.getPropertyValue(`--bubble-${e}-border-top-left-radius`).trim())||0),n("border-top-right-radius",parseFloat(i.getPropertyValue(`--bubble-${e}-border-top-right-radius`).trim())||0),n("border-bottom-right-radius",parseFloat(i.getPropertyValue(`--bubble-${e}-border-bottom-right-radius`).trim())||0),n("border-bottom-left-radius",parseFloat(i.getPropertyValue(`--bubble-${e}-border-bottom-left-radius`).trim())||0),n("border-radius-all",parseFloat(i.getPropertyValue(`--bubble-${e}-border-top-left-radius`).trim())||0),n("padding-vertical",parseFloat(i.getPropertyValue(`--bubble-${e}-padding-top`).trim())||0),n("padding-horizontal",parseFloat(i.getPropertyValue(`--bubble-${e}-padding-left`).trim())||0),n("margin-vertical",parseFloat(i.getPropertyValue(`--bubble-${e}-margin-top`).trim())||0),n("margin-horizontal",parseFloat(i.getPropertyValue(`--bubble-${e}-margin-left`).trim())||0);let y=i.getPropertyValue(`--bubble-${e}-box-shadow`).trim();if(y&&"none"!==y){document.querySelector('[data-variable="shadow-inset"]').checked=y.includes("inset");let f=y.replace("inset","").trim(),h=f.match(/(rgba?\(.*?\)|#([0-9a-fA-F]{3,8})|[a-zA-Z]+)\s*$/),b="rgba(0, 0, 0, 0)";h&&(b=h[0],f=f.substring(0,h.index).trim());let v=f.split(/\s+/).map(e=>parseFloat(e)||0);n("shadow-offset-x",v[0]||0),n("shadow-offset-y",v[1]||0),n("shadow-blur",v[2]||0),n("shadow-spread",v[3]||0);let w;w=b.startsWith("#")?7===b.length?b+"ff":b:rgbaToHex8(b);let E="#"+w.substring(1,7),I=document.querySelector('.hex-input[data-variable="shadow-color"]'),x=document.querySelector('input[type="color"][data-variable="shadow-color"]'),$=x?x.closest(".color-input-wrapper").querySelector(".color-preview"):null;I&&(I.value=w),x&&(x.value=E),$&&($.style.backgroundColor=b)}["deco-1","deco-2"].forEach(a=>{let r=a.split("-")[1],o=`--bubble-${e}-${a}-url`,s=i.getPropertyValue(o).trim(),d=s.match(/url\(['"]?(.*?)['"]?\)/),c=d?d[1]:"",m=t.querySelector(`[data-variable="${a}-url"]`);m&&(m.value=c);let p=`--bubble-${e}-${a}-content`,u=i.getPropertyValue(p).trim();(u.startsWith('"')&&u.endsWith('"')||u.startsWith("'")&&u.endsWith("'"))&&(u=u.slice(1,-1));let g=t.querySelector(`[data-variable="${a}-content"]`);g&&(g.value=u);let y=""!==u,f=document.querySelectorAll(`input[name="deco-${r}-type"]`);f.length>0&&(y?(f[1].checked=!0,document.getElementById(`deco-${r}-image-group`).style.display="none",document.getElementById(`deco-${r}-text-group`).style.display="block"):(f[0].checked=!0,document.getElementById(`deco-${r}-image-group`).style.display="block",document.getElementById(`deco-${r}-text-group`).style.display="none")),l(`${a}-color`,i.getPropertyValue(`--bubble-${e}-${a}-color`).trim()),["width","height","z-index","rotate","font-size"].forEach(t=>{let l=`--bubble-${e}-${a}-${t}`,r=parseFloat(i.getPropertyValue(l).trim())||0;n(`${a}-${t}`,r)}),["top","right","bottom","left"].forEach(n=>{let l=`--bubble-${e}-${a}-${n}`,r=i.getPropertyValue(l).trim(),o=t.querySelector(`[data-variable="${a}-${n}"]`);o&&(o.value=r)})});let L=i.getPropertyValue(`--bubble-${e}-wiggle-scale`).trim()||"0",k=parseFloat(L),T=document.querySelector('[data-variable="wiggle-scale"]');T&&(T.value=k,T.nextElementSibling&&(T.nextElementSibling.textContent=k));let S=document.getElementById(`wiggle-map-${e}`);S&&S.setAttribute("scale",k)}async function tx(){let e=`BLMX_Theme_${k}_${new Date().toISOString().slice(0,10)}.json`,t=await showDialog({mode:"prompt",text:"请输入导出的主题文件名:",defaultValue:e});if(null===t){console.log("[Theme Manager] Export cancelled by user.");return}if(!(t=t.trim())){await showDialog({mode:"alert",text:"文件名不能为空！"});return}t.toLowerCase().endsWith(".json")||(t+=".json");let a=`blmx_global_theme_${k}`,i=`blmx_bubble_theme_${k}`,n=localStorage.getItem(a),l=localStorage.getItem(i),r=n?JSON.parse(n):{},o=l?JSON.parse(l):{},s={meta:{name:`BLMX手机主题 - ${k}`,version:"2.0",exportedAt:new Date().toISOString()},globalTheme:r,bubbleTheme:o},d=JSON.stringify(s,null,2),c=new Blob([d],{type:"application/json"}),m=URL.createObjectURL(c),p=document.createElement("a");p.href=m,p.download=t,document.body.appendChild(p),p.click(),document.body.removeChild(p),URL.revokeObjectURL(m),console.log(`[Theme Manager] Unified theme exported successfully as '${t}'.`)}let t9="blmx-custom-font-style",t$=`blmx_custom_font_css_${k}`;async function t8(){let e=document.getElementById("font-css-input"),t=e.value.trim();if(!t){await showDialog({mode:"alert",text:"请输入有效的 CSS 代码。"});return}localStorage.setItem(t$,t),tk(t),await showDialog({mode:"alert",text:"新字体已成功应用并保存！"})}async function tL(){let e=await showDialog({mode:"confirm",text:"确定要恢复为手机的默认字体吗？\n您保存的自定义字体设置将被清除。"});if(e){localStorage.removeItem(t$);let t=document.getElementById(t9);t&&t.remove(),document.documentElement.style.setProperty("--custom-font-family","'寒蝉全圆体'"),document.getElementById("font-css-input").value="",await showDialog({mode:"alert",text:"已恢复为默认字体。"})}}function tk(e){let t=document.getElementById(t9);t||((t=document.createElement("style")).id=t9,document.head.appendChild(t)),t.textContent=e;let a=e.match(/font-family:\s*(.*?)\s*;/);if(a&&a[1]){let i=a[1];document.documentElement.style.setProperty("--custom-font-family",i),console.log(`[Font Studio] Applied font: ${i}`)}else{let n=e.match(/@font-face\s*{[^}]*font-family:\s*['"]?([^'";]+)['"]?/);if(n&&n[1]){let l=`'${n[1]}'`;document.documentElement.style.setProperty("--custom-font-family",l),console.log(`[Font Studio] Extracted font-face name: ${l}`)}else document.documentElement.style.removeProperty("--custom-font-family")}}function tT(){let e=`blmx_weibo_anonymous_identity_${k}`,t=localStorage.getItem(e);if(t)try{return JSON.parse(t)}catch(a){console.error("解析“马甲”身份信息失败:",a)}return null}async function tS(){let e=await af({title:"配置歌曲信息",fields:[{id:"title",label:"歌名",type:"text",defaultValue:currentSong.title},{id:"artist",label:"歌手",type:"text",defaultValue:currentSong.artist},{id:"src",label:"MP3 直链 URL",type:"text",defaultValue:currentSong.src},{id:"lrc",label:"LRC 歌词文本",type:"textarea",defaultValue:currentSong.lrc}]});if(null!==e){if(!e.src.trim()){await showDialog({mode:"alert",text:"MP3 链接不能为空！"});return}currentSong={title:e.title.trim()||"未知歌曲",artist:e.artist.trim()||"未知歌手",src:e.src.trim(),lrc:e.lrc||""},localStorage.setItem(`blmx_current_song_${k}`,JSON.stringify(currentSong)),document.getElementById("lt-song-title").textContent=currentSong.title,document.getElementById("lt-artist-name").textContent=currentSong.artist,globalAudio.pause(),globalAudio.src=currentSong.src,document.getElementById("lt-play-pause-btn").className="fas fa-play-circle",document.getElementById("lt-vinyl").classList.remove("playing"),document.getElementById("lt-vinyl-view").classList.remove("playing"),console.log("[Lyrics] Reloading lyrics..."),tA(currentSong.lrc),tM(),await showDialog({mode:"alert",text:"歌曲信息已更新！点击播放即可收听。"})}}function tB(e,t){let a=document.getElementById("lt-chat-float-layer");if(!a)return;let i=new Date,n=`${i.getHours().toString().padStart(2,"0")}:${i.getMinutes().toString().padStart(2,"0")}`;G.push({sender:t?"me":"them",text:e,time:n});let l=document.getElementById("lt-history-view");l&&l.classList.contains("active")&&t_();let r=document.createElement("div");r.className=`lt-float-bubble ${t?"me":"them"}`,r.innerHTML=`
<div class="float-content">
	<span class="float-text">${e}</span>
</div>
`,a.appendChild(r),setTimeout(()=>{r.style.transition="opacity 1s ease, transform 1s ease",r.style.opacity="0",r.style.transform="translateY(-20px)",setTimeout(()=>r.remove(),1e3)},5e3)}async function tD(){let e=document.getElementById("lt-chat-input"),t=e.value.trim();if(t&&(document.getElementById("lt-input-overlay").style.display="none",e.value="",tB(t,!0),!b)){b=!0;try{let a=function e(t){let a=_.find(e=>e.id===tN),i=a?ed(a.id,null):"TA",n=G.slice(-20).map(e=>{let t="me"===e.sender?"{{user}}":i;return`${t}: ${e.text}`}).join("\n"),l="(暂无歌词或纯音乐)";return tC&&tC.length>0?l=tC.map(e=>e.text).join("\n"):currentSong.lrc&&(l=currentSong.lrc),`
[任务: 音乐陪伴模式]
你现在是**${i}**，正在和{{user}}一起听歌。
当前播放歌曲: 《${currentSong.title}》 - ${currentSong.artist}。

**[整首歌曲歌词]**:
\`\`\`
${l}
\`\`\`

**[此前的对话记录]**:
${n}

**要求**:
1. 请以${i}的口吻，承接上文的对话记录和正在听的歌曲进行回复。
2. **非常简短**: 回复不要超过20个字，像是在听歌时随口说的一句话。
3. **沉浸感**: 不要打招呼，直接回应。禁止使用任何动作描写。

**输出格式**:
直接输出回复内容，不要任何前缀，不要带引号。
`.trim()}(t);N=a;let i=await v({user_input:a,should_stream:!1});if(M=i,i&&i.trim()){let n=i.trim().replace(/^['"]|['"]$/g,"");tB(n,!1)}}catch(l){console.error("AI Music Chat Failed:",l),tB("...",!1)}finally{b=!1}}}function t_(){let e=document.getElementById("lt-history-list");if(e){if(e.innerHTML="",0===G.length){e.innerHTML='<p style="text-align:center; color:rgba(255,255,255,0.3); margin-top:2rem; font-size:0.8em;">暂无聊天记录</p>';return}G.forEach(t=>{let a=document.createElement("div");a.className=`lt-history-item ${t.sender}`;let i="";if("me"===t.sender)i="我";else{let n=_.find(e=>e.id===tN);i=n?n.remark||n.name:"TA"}a.innerHTML=`
<div class="lt-history-meta">${i} ${t.time}</div>
<div class="lt-history-bubble">${t.text}</div>
`,e.appendChild(a)}),setTimeout(()=>{e.scrollTop=e.scrollHeight},0)}}let tC=[];function tA(e){if(tC=[],!e)return;let t=e.split("\n"),a=/^\s*\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)$/;t.forEach(e=>{let t=e.match(a);if(t){let i=parseInt(t[1]),n=parseInt(t[2]),l=t[3]?parseFloat("0."+t[3]):0,r=t[4].trim();r&&tC.push({time:60*i+n+l,text:r})}}),tC.sort((e,t)=>e.time-t.time),console.log(`[Lyrics] Parsed ${tC.length} lines.`)}function tM(){let e=document.getElementById("lt-lyrics-scroll-area");if(!e)return;if(e.innerHTML="",0===tC.length){e.innerHTML='<div class="lyrics-placeholder" style="margin-top: 50%; color: #888;">暂无歌词</div>';return}let t=document.createElement("div");t.id="lt-lyrics-wrapper",t.style.padding="50vh 0",tC.forEach((e,a)=>{let i=document.createElement("p");i.textContent=e.text,i.dataset.index=a,t.appendChild(i)}),e.appendChild(t)}function tM(){let e=document.getElementById("lt-lyrics-scroll-area");if(!e)return;if(e.innerHTML="",0===tC.length){e.innerHTML='<div class="lyrics-placeholder" style="margin-top: 50%; color: #888;">暂无歌词</div>';return}let t=document.createElement("div");t.id="lt-lyrics-wrapper",t.style.transition="transform 0.3s ease-out",t.style.padding="50% 0",tC.forEach((e,a)=>{let i=document.createElement("p");i.textContent=e.text,i.dataset.index=a,t.appendChild(i)}),e.appendChild(t)}let tN=localStorage.getItem(`blmx_listen_partner_${k}`)||(_.length>0?_[0].id:null);function tO(){let e=document.getElementById("lt-user-avatar");e&&(e.src=A.avatar||"https://files.catbox.moe/bialj8.jpeg");let t=document.getElementById("lt-char-avatar");if(t){let a=_.find(e=>e.id===tN);if(a){t.src=a.avatar;let i=document.getElementById("lt-duration-text");i&&i.textContent.includes("TA")&&(i.textContent=i.textContent.replace("TA",a.name))}else t.src="https://files.catbox.moe/bialj8.jpeg"}}async function t0(){let e=document.getElementById("diary-owner-modal"),t=e.querySelector(".title"),a=t.textContent;t.textContent="选择一起听的朋友";let i=await new Promise(i=>{let n=e.querySelector(".diary-owner-list-container"),l=e.querySelector(".close-btn"),r=n.cloneNode(!1);n.parentNode.replaceChild(r,n);let o=n=>{e.style.display="none",t.textContent=a,i(n)};_.forEach(e=>{let t=document.createElement("div");t.className="diary-owner-list-item",t.innerHTML=`
<img src="${ec(e.id)}" alt="${e.name}">
<span>${e.name}</span>
`,t.addEventListener("click",()=>o(e.id)),r.appendChild(t)}),l.onclick=()=>o(null),e.style.display="flex"});i&&(tN=i,localStorage.setItem(`blmx_listen_partner_${k}`,tN),tO(),await showDialog({mode:"alert",text:`已切换！现在是和 ${ed(i,null)} 一起听。`}))}function tP(e){if(isNaN(e))return"00:00";let t=Math.floor(e/60).toString().padStart(2,"0"),a=Math.floor(e%60).toString().padStart(2,"0");return`${t}:${a}`}function tH(e){if(!e||"string"!=typeof e)return"";let t=e.replace(/\[.*?\]/g,""),a=t.split("\n"),i=a.map(e=>e.trim()).filter(e=>e&&!e.startsWith("欢迎来访")&&"-终-"!==e);return i.join("\n")}let tR="blmx_global_music_playlist";function tq(){try{let e=localStorage.getItem(tR);return e?JSON.parse(e):[]}catch(t){return console.error("读取歌单失败:",t),[]}}function t3(e){localStorage.setItem(tR,JSON.stringify(e))}async function t1(e){let t=tq();if(t.length>=20)return await showDialog({mode:"alert",text:`歌单已满 (${t.length}/20)！
为了保证手机流畅运行，请先删除一些旧歌曲。`}),!1;let a=t.some(t=>t.src===e.src);if(a)return await showDialog({mode:"alert",text:"但这首歌已经在你的歌单里了。"}),!1;let i={title:e.title||"未知歌曲",artist:e.artist||"未知歌手",src:e.src,lrc:e.lrc||"",cover:e.cover||""};return t.push(i),t3(t),!0}async function tU(e){let t=tq();if(e>=0&&e<t.length){let a=t[e].title,i=await showDialog({mode:"confirm",text:`确定要从歌单删除《${a}》吗？`});if(i)return t.splice(e,1),t3(t),!0}return!1}function tG(){let e=tq(),t=document.getElementById("lt-playlist-container"),a=document.getElementById("lt-playlist-count");if(t&&a){if(a.textContent=e.length,t.innerHTML="",0===e.length){t.innerHTML='<p style="text-align:center; color:rgba(255,255,255,0.4); margin-top:2rem; font-size:0.9em;">暂无歌曲<br>点击下方按钮将当前歌曲加入歌单</p>';return}e.forEach((e,a)=>{let i=document.createElement("div");i.className="lt-playlist-item",e.src===currentSong.src&&i.classList.add("active"),i.innerHTML=`
<div class="lt-playlist-info">
	<div class="song-title">${e.title}</div>
	<div class="song-artist">${e.artist}</div>
</div>
<div class="lt-playlist-delete-btn"><i class="fas fa-trash"></i></div>
`,i.addEventListener("click",async t=>{if(!t.target.closest(".lt-playlist-delete-btn")){currentSong={...e},localStorage.setItem(`blmx_current_song_${k}`,JSON.stringify(currentSong)),document.getElementById("lt-song-title").textContent=currentSong.title,document.getElementById("lt-artist-name").textContent=currentSong.artist,tA(currentSong.lrc),tM(),globalAudio.src=currentSong.src;try{await globalAudio.play(),document.getElementById("lt-play-pause-btn").className="fas fa-pause-circle",document.getElementById("lt-vinyl-container").classList.add("playing"),document.getElementById("lt-vinyl-view").classList.add("playing")}catch(a){console.error("播放失败:",a),await showDialog({mode:"alert",text:"播放失败，链接可能已失效。"})}tG()}});let n=i.querySelector(".lt-playlist-delete-btn");n.addEventListener("click",async e=>{e.stopPropagation();let t=await tU(a);t&&tG()}),t.appendChild(i)})}}let tW="list";async function tj(){let e=document.getElementById("lt-mode-btn");"list"===tW?(tW="single",e&&(e.style.color="var(--wechat-green-icon)"),await showDialog({mode:"alert",text:"已切换为：单曲循环"})):(tW="list",e&&(e.style.color="var(--lt-text-primary)"),await showDialog({mode:"alert",text:"已切换为：列表循环"}))}function tY(e,t=!1){let a=tq();if(0===a.length){t||showDialog({mode:"alert",text:"歌单是空的，快去添加歌曲吧！"});return}let i=a.findIndex(e=>e.src===currentSong.src),n=0;if(t&&"single"===tW){if(-1===i){globalAudio.currentTime=0,globalAudio.play();return}n=i}else"next"===e?(n=i+1)>=a.length&&(n=0):(n=i-1)<0&&(n=a.length-1);let l=a[n];currentSong={...l},localStorage.setItem(`blmx_current_song_${k}`,JSON.stringify(currentSong)),document.getElementById("lt-song-title").textContent=currentSong.title,document.getElementById("lt-artist-name").textContent=currentSong.artist,tA(currentSong.lrc),tM(),globalAudio.src=currentSong.src,globalAudio.play().then(()=>{let e=document.getElementById("lt-play-pause-btn");e&&(e.className="fas fa-pause-circle"),document.getElementById("lt-vinyl-container").classList.add("playing"),document.getElementById("lt-vinyl-view").classList.add("playing"),tG()}).catch(e=>{console.error("切歌失败:",e)})}async function t7(e){if(!e||!/[\u4e00-\u9fa5]/.test(e))return e;try{console.log(`[Translator] Detecting Chinese, translating: "${e}"`);let t=`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(e)}`,a="https://corsproxy.io/?"+encodeURIComponent(t),i=await fetch(a);if(!i.ok)throw Error(`HTTP Error ${i.status}`);let n=await i.json(),l="";return n&&n[0]&&n[0].forEach(e=>{e[0]&&(l+=e[0])}),console.log(`[Translator] Result: "${l}"`),l||e}catch(r){return console.warn("[Translator] Translation failed, using original text:",r),e}}async function tz(e){let t=localStorage.getItem(`blmx_nai_key_${k}`);if(!t||!t.startsWith("pst-"))throw Error("无效的 API Key，请在设置中检查");let a=localStorage.getItem(`blmx_nai_model_${k}`)||"nai-diffusion-3",i=localStorage.getItem(`blmx_nai_res_${k}`)||"1024x1024",[n,l]=i.split("x").map(Number),r=a.includes("v4")||a.includes("4-"),o=localStorage.getItem(`blmx_nai_negative_${k}`),s=null!==o?o:"lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",d={input:e,model:a,action:"generate",parameters:{width:n,height:l,scale:5,sampler:"k_euler_ancestral",steps:28,n_samples:1,ucPreset:0,qualityToggle:!0,sm:!r,sm_dyn:!1,seed:Math.floor(9999999999*Math.random()),negative_prompt:s}};r&&(d.parameters.params_version=3,d.parameters.v4_prompt={caption:{base_caption:e,char_captions:[]},use_coords:!1,use_order:!0},d.parameters.v4_negative_prompt={caption:{base_caption:s,char_captions:[]},legacy_uc:!1}),console.log(`[NAI] Model: ${a} (${r?"V4 Stream":"V3 Zip"})`);let c="https://corsproxy.io/?"+encodeURIComponent(`https://image.novelai.net/ai/${r?"generate-image-stream":"generate-image"}`),m=await fetch(c,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+t},body:JSON.stringify(d)});if(!m.ok){let p=await m.text();throw Error(`API Error: ${m.status} ${p.substring(0,50)}`)}if(r){let u=await m.text(),g=u.trim().split("\n"),y=null;for(let f=g.length-1;f>=0;f--){let h=g[f].trim();if(h.startsWith("data:")&&!h.includes("[DONE]"))try{let b=h.substring(5).trim(),v=JSON.parse(b);if(v.image?y=v.image:v.data&&(y=v.data),y)break}catch(w){console.error("Parse line error:",w)}}if(!y)throw Error("未在返回流中找到图片数据");let E=atob(y),I=new Uint8Array(E.length);for(let x=0;x<E.length;x++)I[x]=E.charCodeAt(x);let $=new Blob([I],{type:"image/png"});return URL.createObjectURL($)}{let L=await m.blob();if("undefined"==typeof JSZip)throw Error("JSZip library missing");let T=await JSZip.loadAsync(L),S=Object.keys(T.files).find(e=>e.match(/\.(png|jpg)$/i));if(!S)throw Error("ZIP result is empty");let B=await T.file(S).async("blob");return URL.createObjectURL(B)}}function t2(e){let t=document.getElementById("cp-footprints-list");t.innerHTML="",e.date&&(document.getElementById("cp-footprints-date-title").textContent=e.date),e.items&&0!==e.items.length?e.items.forEach((e,a)=>{if(e.transport_desc){let i=document.createElement("div");i.className="fp-connector",i.innerHTML=`<i class="fas fa-walking"></i> ${e.transport_desc}`,t.appendChild(i)}else if(a>0){let n=document.createElement("div");n.className="fp-connector",n.innerHTML="&nbsp;",t.appendChild(n)}let l=document.createElement("div");l.className="fp-card";let r="fp-icon-circle",o='<i class="fas fa-map-marker-alt"></i>';"workout"===e.type?o='<i class="fas fa-running"></i>':"transport"===e.type?(r+=" transport",o='<i class="fas fa-car"></i>'):r+=" stay",l.innerHTML=`
<div class="${r}">${o}</div>
<div class="fp-info">
	<div class="fp-title">${e.title||"未知活动"}</div>
	<div class="fp-location">${e.location||"未知地点"}</div>
	<div class="fp-time">${e.time}</div>
</div>
<div class="fp-duration">${e.duration||""}</div>
`,t.appendChild(l)}):t.innerHTML='<p style="text-align:center;color:#999;margin-top:2rem;">今日暂无足迹记录</p>';let a=document.querySelector(".fp-map-header");if(a.innerHTML="",e.current_location){let i=document.createElement("div");i.className="fp-realtime-marker",i.innerHTML=`
<div class="fp-realtime-ring"></div>
<i class="fas fa-map-marker-alt fp-realtime-icon"></i>
<div class="fp-realtime-label">${e.current_location}</div>
`,a.appendChild(i)}if(e.map_events&&e.map_events.length>0){let n=[{top:"42%",left:"20%"},{top:"35%",left:"75%"}];e.map_events.slice(0,2).forEach((e,t)=>{let i=n[t]||{top:"50%",left:"50%"},l=document.createElement("div");l.className="fp-map-marker",l.style.top=i.top,l.style.left=i.left,l.innerHTML=`
<i class="fas fa-map-marker-alt"></i>
<div class="fp-map-popup">
	<span class="fp-popup-location">${e.location||"未知地点"}</span>
	<div>${e.content}</div>
</div>
`,l.addEventListener("click",e=>{e.stopPropagation();let t=l.classList.contains("active");document.querySelectorAll(".fp-map-marker.active").forEach(e=>e.classList.remove("active")),t||l.classList.add("active")}),a.appendChild(l)}),a.addEventListener("click",()=>{document.querySelectorAll(".fp-map-marker.active").forEach(e=>e.classList.remove("active"))})}}async function tF(e){if(b)return;let t=document.getElementById("cp-footprints-list");t.innerHTML=`
<div class="nai-loading-placeholder" style="margin-top: 5rem;">
	<i class="fas fa-satellite-dish fa-spin"></i> 正在连接卫星获取数据...
</div>
`,b=!0,eX();try{let a=function e(t){_.find(e=>e.id===t);let a=ed(t,null),i=new Date(window.currentGameDate),n=`${i.getMonth()+1}月${i.getDate()}日`;return`
[任务: 生成角色今日行动足迹]
你现在是 APP 后台数据生成器。请根据角色 **${a}** 的性格、职业和近期剧情，记录 TA 在 **${n}** 截止到当前时间点的行动轨迹。

【输出要求】
1. 只输出一条 JSON 指令，严禁其他废话。
2. \`items\`: 包含 3-6 个主要行程节点。
3. \`type\` 可选值: "stay"(停留/地点), "workout"(运动/健身), "transport"(移动中)。
4. \`transport_desc\` 是两个节点之间的移动描述(如: 步行20分钟)。
5. \`map_events\`: 必须包含 2 个发生在地点的“小插曲/观察/心事”。
6. \`current_location\`: 角色此时此刻所在的具体位置名称（例如：家、公司会议室、XX路口）。

【标准示例】
FOOTPRINTS:{"author":"${t}","date":"${n}","current_location":"家中书房","items":[{"time":"07:30 - 08:00","type":"workout","location":"滨江公园","title":"晨跑5公里","duration":"30分钟"},{"transport_desc":"地铁 40分钟","time":"09:10-12:00","type":"stay","location":"公司","title":"工作会议","duration":"2小时50分"}],"map_events":[{"location":"地铁站出口","content":"在这个转角闻到了很香的烤红薯味。"},{"location":"公司天台","content":"今天的云看起来像一只柯基。"}]}

请开始生成数据。
`.trim()}(e);N=a;let i=await v({user_input:a,should_stream:!1});(M=i.trim())?await ao(M):t.innerHTML='<p style="text-align:center;color:#999;">卫星连接超时 (AI无返回)。</p>'}catch(n){console.error("Footprints generation failed:",n),t.innerHTML=`<p style="text-align:center;color:red;">系统错误: ${n.message}</p>`}finally{b=!1,eX()}}async function tV(e){if(b)return;let t=document.getElementById("gallery-recent-grid");t.innerHTML=`<div class="nai-loading-placeholder" style="grid-column:1/-1; margin-top:2rem;"><i class="fas fa-film fa-spin"></i> 正在显影胶卷...</div>`,b=!0,eX();try{let a=function e(t){let a=ed(t,null);return`
[任务: 生成手机相册内容]
角色: ${a} (ID: ${t})。
请生成 ${a} 手机相册中“最近项目”的 4 张照片数据。

【要求】
1. **图片描述 (image)**: 必须是**中文**的画面描述，用于AI绘图。包含主体、环境、光影。
2. **碎碎念 (caption)**: 照片下方的配文，体现角色当时的心境、吐槽或秘密，控制在20字以内。
3. **时间 (time)**: 格式如 "昨天 23:45", "周五", "刚刚"。

【输出格式】
只输出一条 JSON 指令，不要其他废话：
GALLERY_UPDATE:{"author":"${t}","items":[{"image":"图片1的详细中文画面描述...","caption":"碎碎念1","time":"时间1"},{"image":"图片2描述...","caption":"碎碎念2","time":"时间2"},{"image":"图片3描述...","caption":"碎碎念3","time":"时间3"},{"image":"图片4描述...","caption":"碎碎念4","time":"时间4"}],"trashCount":3,"hiddenCount":2}
`.trim()}(e);N=a;let i=await v({user_input:a,should_stream:!1});(M=i.trim())?await ao(M):t.innerHTML='<p style="text-align:center;color:#999;">胶卷曝光失败 (AI无返回)。</p>'}catch(n){console.error("Gallery generation failed:",n),t.innerHTML=`<p style="text-align:center;color:red;">错误: ${n.message}</p>`}finally{b=!1,eX()}}function t4(e){document.getElementById("cp-gallery-view");let t=document.getElementById("gallery-recent-grid"),a=document.getElementById("cp-gallery-title"),i=ed(e,null);a.textContent=`${i}的相册`;let n=w.logEntries,r=[...n].reverse().find(t=>"gallery_update"===t.type&&t.author===e),o=[...n].reverse().find(t=>"hidden_album_update"===t.type&&t.author===e),s=[...n].reverse().find(t=>"trash_bin_update"===t.type&&t.author===e),d=o&&o.content.items?o.content.items.length:0,c=s&&s.content.items?s.content.items.filter(e=>!e.isRestored).length:0;if(document.querySelector("#folder-hidden .folder-count").textContent=d,document.querySelector("#folder-trash .folder-count").textContent=c,!r){t.innerHTML=`
<div style="grid-column:1/-1; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:2rem; color:var(--text-color-tertiary); gap:1rem;">
	<i class="far fa-images" style="font-size:3rem; opacity:0.3;"></i>
	<p style="margin:0; font-size:0.9em;">相册空空如也</p>
	<button id="manual-gen-gallery-btn" class="studio-btn primary" style="font-size:0.85em; padding:0.4rem 1rem;">
		<i class="fas fa-magic"></i> 生成新回忆
	</button>
</div>
`,document.getElementById("gallery-recent-count").textContent=0;let m=document.getElementById("manual-gen-gallery-btn");m&&m.addEventListener("click",()=>tV(e));return}let p=r.content;t.innerHTML="",document.getElementById("gallery-recent-count").textContent=p.items.length,p.items.forEach((e,a)=>{let i=`${r.id}_img_${a}`,n=l(i,e.image),o=!1;n||(o=!0,n=`
<div class="gallery-text-placeholder" style="width:100%; height:100%; background:var(--card-bg-primary); color:var(--text-color-secondary); padding:0.8rem; box-sizing:border-box; display:flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; text-align:center;">
	<i class="fas fa-quote-left" style="font-size:1.2rem; margin-bottom:0.5rem; opacity:0.3;"></i>
	<div style="font-size:0.8em; line-height:1.5; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; word-break:break-all; opacity:0.8;">
		${e.image}
	</div>
	<div style="font-size:0.6em; color:var(--text-color-tertiary); margin-top:0.5rem;">● 点击查看全文</div>
</div>
`);let s=document.createElement("div");if(s.className="gallery-card",s.innerHTML=`
<div class="gallery-img-box">
	${n}
</div>
<div class="gallery-caption-box">
	<div class="gallery-caption">${e.caption}</div>
	<div class="gallery-date">${e.time}</div>
</div>
`,o){let d=s.querySelector(".gallery-img-box");d.addEventListener("click",t=>{t.stopPropagation(),showDialog({mode:"alert",text:`<div style="text-align:left; white-space: pre-wrap;">${e.image}</div>`})})}t.appendChild(s)})}async function t6(e){if(b)return;let t=document.querySelector(".hidden-album-body");t.innerHTML=`
<div class="nai-loading-placeholder" style="background:rgba(255,255,255,0.1); color:white; border:1px dashed rgba(255,255,255,0.3); padding:2rem;">
	<i class="fas fa-key fa-spin"></i> 正在解密私有区域...<br><br>
	<span style="font-size:0.8em; opacity:0.7;">(AI正在构思私密内容)</span>
</div>`,b=!0,eX();try{let a=function e(t){let a=ed(t,null);return`
[任务: 生成加密相册内容]
角色: ${a} (ID: ${t})。
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
HIDDEN_ALBUM_UPDATE:{"author":"${t}","items":[{"image":"图片1的视觉画面描述","text":"私密心声...","time":"时间1"},{"image":"图片2的视觉画面描述","text":"私密心声...","time":"时间2"}]}
`.trim()}(e);N=a;let i=await v({user_input:a,should_stream:!1});(M=i.trim())?await ao(M):t.innerHTML='<p style="color:rgba(255,255,255,0.5); text-align:center;">一片漆黑...(AI无返回)</p>'}catch(n){console.error("Hidden Album generation failed:",n),t.innerHTML=`<p style="color:#ff6b6b; text-align:center;">解密失败: ${n.message}</p>`}finally{b=!1,eX()}}function tX(e){let t=document.querySelector(".hidden-album-body");t.innerHTML="";let a=[...w.logEntries].reverse().find(t=>"hidden_album_update"===t.type&&t.author===e);if(!a){t.innerHTML=`
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
`;let i=document.getElementById("manual-gen-hidden-btn");i&&i.addEventListener("click",()=>t6(e));return}let r=a.content;r.items.forEach((e,i)=>{let r=`${a.id}_img_${i}`,o=l(r,e.image),s=!1;o||(s=!0,o=`
<div class="hidden-placeholder-content">
	<i class="fas fa-eye-slash" style="font-size:1.5em; margin-bottom:0.8rem; opacity:0.5;"></i>
	<div class="hidden-placeholder-desc">${e.image}</div>
	<div class="hidden-placeholder-hint">点击查看画面描述</div>
</div>`);let d=document.createElement("div");d.className="hidden-card",d.innerHTML=`
<div class="hidden-img-box">
	${o}
</div>
<div class="hidden-text-box">${e.text.trim()}</div>
<div class="hidden-date">${e.time}</div>
`;let c=d.querySelector(".hidden-img-box");s?c.addEventListener("click",t=>{t.stopPropagation(),showDialog({mode:"alert",text:`<div style="text-align:left; white-space: pre-wrap; line-height:1.6;">${e.image}</div>`})}):c.addEventListener("click",()=>{let e=c.querySelector("img");e&&n(e.src)}),t.appendChild(d)})}async function t5(e){if(b)return;let t=document.getElementById("trash-list-container");t.innerHTML=`
<div class="nai-loading-placeholder" style="margin-top:2rem;">
	<i class="fas fa-recycle fa-spin"></i> 正在扫描数据碎片...
</div>`,b=!0,eX();try{let a=function e(t){let a=ed(t,null);return`
[任务: 生成最近删除内容]
角色: ${a} (ID: ${t})。
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
TRASH_BIN_UPDATE:{"author":"${t}","items":[{"image":"废弃内容1的画面描述","text":"原本的配文...","reason":"删除理由","time":"删除时间","daysLeft":29},{"image":"废弃内容2的画面描述","text":"...","reason":"...","time":"...","daysLeft":15},{"image":"废弃内容3...","text":"...","reason":"...","time":"...","daysLeft":3}]}
`.trim()}(e);N=a;let i=await v({user_input:a,should_stream:!1});(M=i.trim())?await ao(M):t.innerHTML='<p style="color:#999; text-align:center;">垃圾桶是空的。</p>'}catch(n){console.error("Trash Bin generation failed:",n),t.innerHTML=`<p style="color:red; text-align:center;">错误: ${n.message}</p>`}finally{b=!1,eX()}}function tK(e){let t=document.getElementById("trash-list-container");t.innerHTML="";let a=[...w.logEntries].reverse().find(t=>"trash_bin_update"===t.type&&t.author===e);if(!a){t.innerHTML=`
<div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--text-color-tertiary); gap:1rem;">
	<i class="fas fa-trash" style="font-size:3rem; opacity:0.3;"></i>
	<p style="margin:0;">垃圾桶是空的</p>
	<button id="manual-gen-trash-btn" class="studio-btn secondary" style="font-size:0.85em; padding:0.4rem 1rem;">
		<i class="fas fa-search"></i> 扫描数据碎片
	</button>
</div>
`;let i=document.getElementById("manual-gen-trash-btn");i&&i.addEventListener("click",()=>t5(e));return}let n=a.content;n.items.forEach((i,n)=>{if(i.isRestored)return;let r=`${a.id}_img_${n}`,o=l(r,i.image);o||(o='<div style="width:100%; height:100%; background:#ddd; display:flex; justify-content:center; align-items:center; color:#999; font-size:0.8em;"><i class="fas fa-image"></i></div>');let s=document.createElement("div");s.className="trash-item",s.innerHTML=`
<div class="trash-thumb">${o}</div>
<div class="trash-content">
	<div class="trash-reason">删除理由: ${i.reason}</div>
	<div class="trash-text-preview">"${i.text}"</div>
	<div class="trash-meta">
		<span class="trash-countdown">剩余 ${i.daysLeft} 天</span>
		<span class="trash-recover-btn">恢复</span>
	</div>
</div>
`;let d=s.querySelector(".trash-recover-btn");d.addEventListener("click",async a=>{a.stopPropagation(),s.style.transition="all 0.3s ease",s.style.opacity="0",s.style.transform="translateX(20px)",setTimeout(async()=>{i.isRestored=!0,await tJ(e,i,r),s.remove(),0===t.children.length&&(t.innerHTML='<p style="text-align:center;color:#999;margin-top:2rem;">没有废弃项目了。</p>')},300)}),s.addEventListener("click",()=>{showDialog({mode:"alert",text:`
<div style="text-align:left;">
	<div style="font-weight:bold; margin-bottom:0.5rem; color:#E53935;">为什么删除：${i.reason}</div>
	<div style="margin-bottom:0.5rem; padding:0.5rem; background:#f5f5f5; border-radius:4px; font-size:0.9em;">${i.image}</div>
	<div style="font-style:italic; color:#666;">"${i.text}"</div>
</div>
`})}),t.appendChild(s)})}async function tJ(t,a,n){let l={image:a.image,caption:`[已恢复] ${a.text}`,time:"刚刚"},r=[...w.logEntries].reverse().find(e=>"gallery_update"===e.type&&e.author===t),o=[];r&&r.content&&r.content.items&&(o=[...r.content.items]),o.unshift(l);let s={author:t,items:o,hiddenCount:r?r.content.hiddenCount:2,trashCount:r?r.content.trashCount-1:0},d=`msg-gallery-recover-${Date.now()}`;w.addEntry({id:d,type:"gallery_update",author:t,content:s,timestamp:new Date(window.currentGameDate).toISOString()});let c=e.get(n);c?e.set(`${d}_img_0`,c):i(`${d}_img_0`,l.image,"gallery"),await w.persistLogToStorage(),await showDialog({mode:"alert",text:"照片已恢复到相册！"})}async function tZ(e){if(b)return;let t=document.querySelector("#cp-shopping-view .shopping-body");t.innerHTML=`
<div class="nai-loading-placeholder" style="margin-top: 5rem;">
	<i class="fas fa-shopping-bag fa-spin"></i> 正在同步购物车数据...
</div>
`,b=!0,eX();try{let a=function e(t){let a=ed(t,null);return`
[任务: 生成手机购物车内容]
角色: ${a} (ID: ${t})。
场景: 这是 ${a} 的淘宝购物车。请根据角色性格、近期剧情和内心隐藏的欲望，生成 **3-4个** 待购商品。

【商品要求】
1. **店铺名 (shopName)**: 必须像真实的淘宝店铺名，如"xx旗舰店"、"xx代购"、"xx的手作铺"。
2. **商品标题 (title)**: 充满淘宝风格的**超长标题**，包含修饰词。例如："【现货】法式复古..."。
3. **内心备注 (note)**: **核心有趣点**。角色为什么把这个放购物车？是在犹豫价格？是在幻想使用场景？还是不敢买？
4. **促销标签 (reason)**: 促使角色加购的动机，如"满300减40"、"深夜冲动"、"博主推荐"、"仅剩一件"。
5. **图片描述 (image)**: **中文**的视觉画面描述，用于AI生成商品图。

【输出格式】
严格遵守以下 JSON 格式，只输出一条 JSON 指令，严禁其他废话：
SHOPPING_UPDATE:{"author":"${t}","items":[{"shopName":"店铺A","title":"长标题A...","price":"199.00","image":"商品的视觉描述...","note":"内心备注...","reason":"促销标签"},{"shopName":"店铺B","title":"长标题B...","price":"59.90","image":"描述...","note":"备注...","reason":"标签"}]}
`.trim()}(e);N=a;let i=await v({user_input:a,should_stream:!1});(M=i.trim())?await ao(M):t.innerHTML='<p style="text-align:center;color:#999;margin-top:2rem;">购物车是空的 (AI无返回)。</p>'}catch(n){console.error("Shopping generation failed:",n),t.innerHTML=`<p style="text-align:center;color:red;">加载失败: ${n.message}</p>`}finally{b=!1,eX()}}async function tQ(){if(!L)return;let e=B;if(!e)return;let t={shopName:L.shop||"未知店铺",title:L.title,price:L.price,image:L.image,note:"从详情页加购",reason:"种草",addedAt:Date.now()},a=[...w.logEntries].reverse().find(t=>"shopping_update"===t.type&&t.author===e),i=[];a&&a.content&&a.content.items&&(i=[...a.content.items]),i.unshift(t),w.logEntries=w.logEntries.filter(t=>!("shopping_update"===t.type&&t.author===e));let n=`msg-shopping-update-${Date.now()}`,l={author:e,items:i};w.addEntry({id:n,type:"shopping_update",author:e,content:l,timestamp:new Date(window.currentGameDate).toISOString()}),await w.persistLogToStorage(),await showDialog({mode:"alert",text:"已成功加入购物车！"})}async function ae(){let e=document.getElementById("cp-shopping-view"),t=document.getElementById("cp-shopping-manage-btn"),a=e.querySelector(".sp-footer-left"),i=e.querySelector(".sp-footer-right"),n="完成"===t.textContent;if(n){t.textContent="管理",t.style.color="",a.style.display="flex",i.innerHTML=`
<div class="sp-total-price">合计: <span>\xa50.00</span></div>
<button class="sp-checkout-btn">帮TA清空</button>
`;let l=B,r=[...w.logEntries].reverse().find(e=>"shopping_update"===e.type&&e.author===l);e.querySelector(".sp-checkout-btn").onclick=()=>aa(l,r?r.id:null),e.querySelectorAll(".item-checkbox").forEach(e=>e.checked=!1)}else t.textContent="完成",t.style.color="var(--tb-primary-orange)",a.style.display="flex",i.innerHTML=`
<button class="sp-delete-btn" style="border:1px solid #ff4d4f; color:#ff4d4f; background:transparent; border-radius:20px; padding:0.4rem 1.2rem; font-size:0.9em;">删除</button>
`,e.querySelector(".sp-delete-btn").onclick=async()=>{let t=e.querySelectorAll(".item-checkbox:checked");if(0===t.length)return;let a=await showDialog({mode:"confirm",text:`确定要删除这 ${t.length} 个商品吗？`});if(!a)return;let i=B,n=[...w.logEntries].reverse().find(e=>"shopping_update"===e.type&&e.author===i);if(!n)return;let l=[];t.forEach(e=>{let t=e.closest(".sp-item");l.push(parseInt(t.dataset.itemIndex,10))});let r=n.content.items,o=r.filter((e,t)=>!l.includes(t));w.logEntries=w.logEntries.filter(e=>!("shopping_update"===e.type&&e.author===i));let s=`msg-shopping-del-${Date.now()}`;w.addEntry({id:s,type:"shopping_update",author:i,content:{author:i,items:o},timestamp:new Date(window.currentGameDate).toISOString()}),await w.persistLogToStorage(),ae(),at(i),await showDialog({mode:"alert",text:"删除成功。"})}}function at(e){let t=document.getElementById("cp-shopping-view"),a=t.querySelector(".shopping-body"),i=t.querySelector(".sp-total-price span"),r=t.querySelector(".sp-checkout-btn"),o=t.querySelector(".sp-footer-left .sp-checkbox"),s=[...w.logEntries].reverse().find(t=>"shopping_update"===t.type&&t.author===e),d=s&&s.content&&s.content.items?s.content.items:[];a.innerHTML="";let c=ed(e,null);if(t.querySelector(".settings-header .title").textContent=`${c}的购物车 (${d.length})`,0===d.length){a.innerHTML=`
            <div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--text-color-tertiary); gap:1rem; margin-top: 5rem;">
                <i class="fas fa-shopping-cart" style="font-size:3rem; opacity:0.3;"></i>
                <p style="margin:0;">购物车是空的</p>
                <button id="manual-gen-shop-btn" class="studio-btn primary" style="font-size:0.85em; padding:0.4rem 1rem;">
                    <i class="fas fa-magic"></i> 帮TA加购商品
                </button>
            </div>
        `;let m=document.getElementById("manual-gen-shop-btn");m&&m.addEventListener("click",()=>tZ(e)),i&&(i.textContent="\xa50.00"),r&&(r.textContent="购物车为空",r.disabled=!0,r.style.opacity="0.6"),o&&(o.checked=!1);return}let p={};d.forEach((e,t)=>{e._index=t;let a=e.shopName||"未知店铺";p[a]||(p[a]=[]),p[a].push(e)}),Object.keys(p).forEach(e=>{let t=p[e],i=document.createElement("div");i.className="sp-shop-card";let r=`
            <div class="sp-shop-header">
                <i class="fas fa-store sp-shop-icon taobao"></i>
                <span class="sp-shop-name">${e} <i class="fas fa-chevron-right" style="font-size:0.7em; color:#ccc;"></i></span>
            </div>
        `;t.forEach(e=>{let t=e._index,a=s&&s.id?`${s.id}_img_${t}`:`temp_img_${t}`,i=l(a,e.image),n=!1;if(i)i.includes("<img");else if(e.image&&(e.image.startsWith("http")||e.image.startsWith("blob:")))i=`<img src="${e.image}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.onerror=null;this.src='https://files.catbox.moe/c41va3.jpg';">`;else{n=!0;let o=(e.image||"").replace(/"/g,"&quot;");i=`<div class="sp-text-placeholder" data-full-text="${o}" style="background: url('https://files.catbox.moe/c41va3.jpg') center/cover no-repeat; color: transparent;">${e.image}</div>`}r+=`
            <div class="sp-item" data-item-index="${t}" data-price="${e.price||0}" data-title="${e.title||"未知商品"}">
                <input type="checkbox" class="sp-checkbox item-checkbox" style="margin-top: 2.5rem;">
                
                <div class="sp-item-thumb">
                    ${i}
                </div>
                
                <div class="sp-item-details">
                    <div class="sp-item-title">${e.title||"无标题"}</div>
                    <div class="sp-item-monologue">备注: ${e.note||""}</div>
                    <div class="sp-item-reason">${e.reason||""}</div>
                    <div class="sp-price-row">
                        <span class="sp-price">${e.price||"0.00"}</span>
                        <div class="sp-quantity">
                            <span class="sp-qty-btn">-</span>
                            <span class="sp-qty-num">1</span>
                            <span class="sp-qty-btn">+</span>
                        </div>
                    </div>
                </div>
            </div>
            `}),i.innerHTML=r,a.appendChild(i),i.querySelectorAll(".sp-item-monologue").forEach((e,a)=>{e.addEventListener("click",e=>{e.stopPropagation(),showDialog({mode:"alert",text:`<strong>🛒 加购备注</strong>

${t[a].note||""}`})})}),i.querySelectorAll(".sp-item-thumb").forEach(e=>{let t=e.querySelector("img"),a=e.querySelector(".sp-text-placeholder");e.addEventListener("click",e=>{e.stopPropagation(),t?n(t.src):a&&showDialog({mode:"alert",text:a.dataset.fullText})})})});let u=a.querySelectorAll(".item-checkbox"),g=()=>{let e=0,t=0;if(u.forEach(a=>{if(a.checked){let i=a.closest(".sp-item");e+=parseFloat(String(i.dataset.price).replace(/,/g,""))||0,t++}}),i&&(i.textContent="\xa5"+e.toFixed(2)),r){let a=document.getElementById("cp-shopping-manage-btn"),n=a&&"完成"===a.textContent;n||(0===t?(r.textContent=`请选择`,r.disabled=!0,r.style.opacity="0.6"):(r.textContent=`帮TA付 (${t})`,r.disabled=!1,r.style.opacity="1"))}};if(u.forEach(e=>e.addEventListener("change",g)),o){let y=o.cloneNode(!0);o.parentNode.replaceChild(y,o),y.addEventListener("change",e=>{let t=e.target.checked;u.forEach(e=>e.checked=t),g()})}r&&(r.onclick=()=>aa(e,s?s.id:null)),g()}async function aa(e,t){let a=document.getElementById("cp-shopping-view"),i=a.querySelectorAll(".item-checkbox:checked");if(0===i.length)return;let n=[],l=[],r=0;i.forEach(e=>{let t=e.closest(".sp-item"),a=parseInt(t.dataset.itemIndex,10),i=t.dataset.title,o=parseFloat(t.dataset.price);n.push({title:i,price:o}),l.push(a),r+=o});let o=await showDialog({mode:"confirm",text:`确定要帮 ${ed(e,null)} 支付这 ${n.length} 件商品吗？
合计：\xa5${r.toFixed(2)}`});if(!o)return;let s=w.logEntries.find(e=>e.id===t);s&&s.content&&s.content.items&&(l.sort((e,t)=>t-e),l.forEach(e=>{s.content.items.splice(e,1)}),await w.persistLogToStorage());let d={payer:A.name,receiver:e,items:n,total:r.toFixed(2),timestamp:new Date().toLocaleString()},c=C.find(t=>"single"===t.type&&t.members.includes(e));c||(c={id:`convo_single_${e}`,type:"single",members:["user",e]},C.push(c)),w.addEntry({type:"payment_receipt",sender:"user",conversationId:c.id,content:JSON.stringify(d),timestamp:new Date(window.currentGameDate).toISOString()}),await w.persistLogToStorage(),el(),await showDialog({mode:"alert",text:"支付成功！回执单已发送给对方。"}),at(e),ep("wechatChat",{conversationId:c.id})}async function ai(e,t=null,a=null){if(b)return;let i=document.getElementById("shopping-home-feed"),n="正在刷新推荐流...";t?n=`正在搜索 "${t}"...`:a&&(n=`正在进入【${a.name}】频道...`),i.innerHTML=`
<div class="nai-loading-placeholder" style="grid-column: 1 / -1; margin-top: 2rem;">
	<i class="fas fa-search fa-spin"></i> ${n}
</div>
`,b=!0,eX();try{let l=function e(t,a=null,i=null){let n=ed(t,null),l="",r="";return a?l=`用户刚刚搜索了关键词【${a}】。请生成 4 个与该关键词高度相关但风格各异的搜索结果商品。同时将 "${a}" 插入到 history 搜索历史数组的第一位。`:i?(l=`用户点击了首页的【${i.name}】频道。请根据该频道的特性，为角色推荐 4 个商品。`,i.instruction&&(r=`
**【频道特殊要求】**:
${i.instruction}`)):l=`请根据该角色的**性格、职业、近期经历、潜在欲望**，推算出TA打开淘宝时会看到的首页内容 (推荐流)。`,`
[任务: 淘宝首页内容生成]
用户: ${n} (ID: ${t})。
${l}
${r}

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
TAOBAO_HOME:{"author":"${t}","history":["搜索词1","搜索词2"],"items":[{"title":"商品标题...","price":"29.9","shop":"xx旗舰店","image":"视觉描述...","tag":"推荐理由"},{"title":"...","price":"...","shop":"...","image":"...","tag":"..."}]}
`.trim()}(e,t,a);N=l;let r=await v({user_input:l,should_stream:!1});(M=r.trim())?await ao(M):i.innerHTML='<p style="text-align:center;color:#999; grid-column:1/-1;">加载失败 (AI无返回)。</p>'}catch(o){console.error("Shopping Home generation failed:",o),i.innerHTML=`<p style="text-align:center;color:red; grid-column:1/-1;">错误: ${o.message}</p>`}finally{b=!1,eX()}}function an(e){let t=document.getElementById("shopping-home-feed");if(!t)return;let a=[...w.logEntries].reverse().find(t=>"taobao_home"===t.type&&t.author===e);if(!a){t.innerHTML=`
<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-color-tertiary);">
	<i class="fas fa-shopping-bag" style="font-size:3rem; opacity:0.3; margin-bottom:1rem;"></i>
	<p>首页空空如也</p>
	<button id="init-tb-home-btn" class="studio-btn primary" style="margin-top:1rem;">
		<i class="fas fa-sync-alt"></i> 刷新推荐
	</button>
</div>
`;let i=document.getElementById("init-tb-home-btn");i&&(i.onclick=()=>ai(e));return}let n=a.content;t.innerHTML="",n.items&&n.items.length>0&&n.items.forEach((e,i)=>{let n=`${a.id}_img_${i}`,r=l(n,e.image);if(!r){let o=(e.image||"").replace(/"/g,"&quot;");r=`<div class="tb-img-placeholder-text" data-full-text="${o}" style="background: url('https://files.catbox.moe/c41va3.jpg') center/cover no-repeat;"></div>`}let s=document.createElement("div");s.className="tb-product-card",s.innerHTML=`
<div class="tb-product-img">
	${r}
</div>
<div class="tb-product-info">
	<div class="tb-product-title">${e.title||"未知商品"}</div>
	<div class="tb-tags-row">
		<span class="tb-tag">${e.tag||"猜你喜欢"}</span>
	</div>
	<div class="tb-price-row">
		<span class="tb-symbol">\xa5</span>
		<span class="tb-price-num">${e.price||"0.00"}</span>
		<span class="tb-sales">${e.shop||"淘宝好店"}</span>
	</div>
</div>
`;let d=s.querySelector(".tb-img-placeholder-text");d&&d.addEventListener("click",e=>{e.stopPropagation(),showDialog({mode:"alert",text:d.dataset.fullText})}),t.appendChild(s)});let r=document.querySelector(".tb-search-input");if(r&&n.history&&n.history.length>0){D&&clearInterval(D);let o=0;r.placeholder=n.history[0],D=setInterval(()=>{o=(o+1)%n.history.length,r.placeholder=n.history[o]},3e3)}}function al(){let e=B;if(!e)return;let t=_.find(t=>t.id===e),a=t?t.remark||t.name:"淘宝用户",i=t?t.avatar:"https://files.catbox.moe/bialj8.jpeg";document.getElementById("tb-user-name").textContent=a,document.getElementById("tb-user-avatar").src=i}function ar(e){L=e;let t=document.getElementById("tb-detail-hero");t.innerHTML="";let a="";a=e.image&&e.image.startsWith("http")?`<img src="${e.image}" alt="Product Image">`:`
<div class="tb-detail-hero-text">
	${e.image||"暂无画面描述"}
</div>
`,e._imgBlobUrl&&(a=`<img src="${e._imgBlobUrl}" alt="Generated Image">`),t.innerHTML=a,document.getElementById("tb-detail-price").textContent=e.price||"99.00",document.getElementById("tb-detail-title").textContent=e.title||"未知商品",document.getElementById("tb-detail-shop-name").textContent=e.shop||"官方旗舰店"}async function ao(e,t={}){let a=[],{contextCategory:n=null,contextPostId:l=null}=t,r=e.trim();if(!r)return;let o=["EVENT_LOG","GROUP_EVENT","SIGNATURE_UPDATE","RECALL_MESSAGE","MOMENT","CHAR_COMMENT","CHAR_LIKE","CREATE_GROUP","KICK_MEMBER","LEAVE_GROUP","MUTE_MEMBER","SET_ADMIN","CHANGE_NICKNAME","RENAME_GROUP","WEIBO_POST","WEIBO_COMMENT","WEIBO_LIKE","DELETE_WEIBO_POST","DIARY_ENTRY","FORUM_THREAD","WEIBO_POST_CONTENT","WEIBO_INITIAL_COMMENT","VIDEO_CALL","END_CALL","UPDATE_CALL_SCREEN","INVITE_MEMBER","MUSIC_SHARE","FOOTPRINTS","GALLERY_UPDATE","HIDDEN_ALBUM_UPDATE","TRASH_BIN_UPDATE","SHOPPING_UPDATE","TAOBAO_HOME"],s=RegExp(`(${o.join("|")}):`,"g"),c=r.split(s),m=new Date(window.currentGameDate),p=`${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,"0")}-${String(m.getDate()).padStart(2,"0")} ${String(m.getHours()).padStart(2,"0")}:${String(m.getMinutes()).padStart(2,"0")}`,u=function e(t,a){if(!t||a<=0)return[];let i=new Date(t.replace(" ","T"));if(isNaN(i.getTime()))return console.error("[Timestamp Generator] 提供的基础时间戳无效:",t),[];let n=i,l=[];for(let r=0;r<a;r++){let o=27e4*Math.random()+3e4;n=new Date(n.getTime()+o);let s=n.getFullYear(),d=String(n.getMonth()+1).padStart(2,"0"),c=String(n.getDate()).padStart(2,"0"),m=String(n.getHours()).padStart(2,"0"),p=String(n.getMinutes()).padStart(2,"0"),u=`${s}-${d}-${c}T${m}:${p}`;l.push(u)}return l}(p,Math.max(1,c.length/2)),g=0,y=null,f=(e,t)=>{try{(t=t.trim()).endsWith("]")&&(t=t.slice(0,-1)),t=t.replace(/\n/g,"\\n");let r=JSON.parse(t),o=document.getElementById("weibo-detail-view");if(("WEIBO_POST_CONTENT"===e||"WEIBO_COMMENT"===e||"WEIBO_INITIAL_COMMENT"===e)&&l&&("WEIBO_POST_CONTENT"===e&&(r.postId=l),("WEIBO_COMMENT"===e||"WEIBO_INITIAL_COMMENT"===e)&&(r.target_post_id=l)),"WEIBO_POST"!==e||r.postId||(r.postId=`weibo_${Date.now()}_${Math.random().toString(36).substr(2,9)}`),"MOMENT"!==e||r.momentId||(r.momentId=`moment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`),a.push(r),u[g]&&["WEIBO_COMMENT","WEIBO_INITIAL_COMMENT","FORUM_THREAD"].includes(e)&&(r.timestamp=u[g],g++),"CHAR_COMMENT"===e&&r.text){let s=r.text.match(/^\[引用:"(.*?):\s*(.*?)"\]\s*(.*)$/s);if(s){let d=s[1].trim(),c=s[2].trim(),m=s[3].trim(),p=e=>{if(e.author!==d)return!1;let t=e.text&&e.text.includes(c),a=e.image&&e.image.includes(c);return t||a},f=[...a].reverse().find(p);if(!f){let h=w.logEntries.filter(e=>"MOMENT"===e.key).map(e=>e.data);f=[...h].reverse().find(p)}f?(r.target_post_id=f.momentId,r.text=m,console.log(`[Moments Match] 成功通过引用定位到朋友圈 ID: ${f.momentId}`)):console.warn(`[Moments Match] 未找到匹配的朋友圈: ${d} - ${c}`)}}if("WEIBO_COMMENT"===e||"WEIBO_INITIAL_COMMENT"===e){let b=r.target_post_id,v=r.text,E=v.match(/\[引用:"(.*?):\s*([\s\S]*?)"\]([\s\S]*)/),I;if(E){let $=E[1].trim(),L=E[2].trim(),k=E[3].trim(),S=(O.comments[b]||[]).find(e=>ed(e.author,null)===$&&e.text.trim()===L);I=S?{...r,text:k,replyTo:S.commentId,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,isRead:"WEIBO_INITIAL_COMMENT"===e}:{...r,text:v,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,isRead:"WEIBO_INITIAL_COMMENT"===e}}else I={...r,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,isRead:"WEIBO_INITIAL_COMMENT"===e};I&&"desc"===I.image_type&&I.image?i(I.commentId,I.image,"weibo"):!I&&"desc"===r.image_type&&r.image&&i(r.commentId,r.image,"weibo"),w.addEntry({key:"WEIBO_COMMENT",data:I||r}),o.classList.contains("active")&&o.dataset.postId===b&&(e3(),e_(I||r));return}switch(e){case"WEIBO_POST":"desc"===r.image_type&&r.image&&i(r.postId,r.image,"weibo"),eV(e,r,l);break;case"MUSIC_SHARE":if(r.author){let D={title:r.title||"未知歌曲",artist:r.artist||"未知歌手",cover:r.cover||""},A={type:"music_share",sender:r.author,conversationId:T,data:D,timestamp:new Date(window.currentGameDate).toISOString()};w.addEntry(A),eS(T,A.timestamp),x=!0}break;case"FOOTPRINTS":let M={type:"footprints",author:r.author,content:r,timestamp:new Date(window.currentGameDate).toISOString()};w.addEntry(M),document.getElementById("cp-footprints-view").classList.contains("active")&&B===r.author&&t2(r);break;case"GALLERY_UPDATE":r.author||(r.author=B||"unknown");let N=`msg-gallery-${Date.now()}`,H={id:N,type:"gallery_update",author:r.author,content:r,timestamp:new Date(window.currentGameDate).toISOString()};w.addEntry(H),r.items&&Array.isArray(r.items)&&r.items.forEach((e,t)=>{let a=`${N}_img_${t}`;e.image&&i(a,e.image,"gallery")});let R=document.getElementById("cp-gallery-view");R&&R.classList.contains("active")&&t4(r.author),console.log("[Gallery] Parsed, queued NAI, and rendered update for:",r.author);break;case"HIDDEN_ALBUM_UPDATE":case"TRASH_BIN_UPDATE":r.author||(r.author=B||"unknown");let U=`msg-${e.toLowerCase()}-${Date.now()}`;w.addEntry({id:U,type:e.toLowerCase(),author:r.author,content:r,timestamp:new Date(window.currentGameDate).toISOString()}),r.items&&Array.isArray(r.items)&&r.items.forEach((e,t)=>{let a=`${U}_img_${t}`;e.image&&i(a,e.image,"gallery")});let G=document.getElementById("cp-hidden-album-view"),W=document.getElementById("cp-trash-bin-view");"HIDDEN_ALBUM_UPDATE"===e&&G.classList.contains("active")&&tX(r.author),"TRASH_BIN_UPDATE"===e&&W.classList.contains("active")&&tK(r.author);break;case"SHOPPING_UPDATE":r.author||(r.author=B||"unknown");let j=`msg-shopping-${Date.now()}`;w.addEntry({id:j,type:"shopping_update",author:r.author,content:r,timestamp:new Date(window.currentGameDate).toISOString()}),r.items&&Array.isArray(r.items)&&r.items.forEach((e,t)=>{let a=`${j}_img_${t}`;e.image&&i(a,e.image,"shopping")});let Y=document.getElementById("cp-shopping-view");Y&&Y.classList.contains("active")&&at(r.author);break;case"TAOBAO_HOME":r.author||(r.author=B||"unknown");let z=`msg-tb-home-${Date.now()}`;w.logEntries=w.logEntries.filter(e=>!("taobao_home"===e.type&&e.author===r.author)),w.addEntry({id:z,type:"taobao_home",author:r.author,content:r,timestamp:new Date(window.currentGameDate).toISOString()}),r.items&&Array.isArray(r.items)&&r.items.forEach((e,t)=>{let a=`${z}_img_${t}`;e.image&&i(a,e.image,"shopping_home")});let F=document.getElementById("cp-shopping-home-view");F&&F.classList.contains("active")&&an(r.author);break;case"VIDEO_CALL":if("idle"===P){let V={key:"VIDEO_CALL",data:{caller:r.caller,receiver:r.receiver,timestamp:new Date(window.currentGameDate).toISOString(),status:"unanswered"}};w.addEntry(V),w.persistLogToStorage(),function e(t){let a=_.find(e=>e.id===t);if(!a){console.error(`[Incoming Call] Failed: Cannot find contact with ID ${t}`);return}P="incoming",q={id:a.id,name:ed(a.id,null),avatar:ec(a.id)};let i=document.getElementById("incoming-call-screen");i.querySelector(".caller-avatar").src=q.avatar,i.querySelector(".caller-name").textContent=q.name,eg("incoming-call-screen")}(r.caller)}break;case"END_CALL":"in-call"===P&&r.ender===q.id&&(showDialog({mode:"alert",text:`${ed(r.ender,null)} 挂断了通话。`}),ey());break;case"UPDATE_CALL_SCREEN":eu(r);break;case"FORUM_THREAD":let X={postId:`weibo_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,author:r.author,title:r.title,isPinned:r.isPinned||!1,hotness:r.hotness||0,category:n,timestamp:r.timestamp};w.addEntry({key:"WEIBO_POST",data:X});break;case"WEIBO_POST_CONTENT":let K=r.postId,J=O.posts.find(e=>e.postId===K);if("desc"===r.image_type&&r.image&&i(r.postId,r.image,"weibo"),J){J.text=r.content,r.image&&(J.image=r.image,J.image_type=r.image_type);let Z=w.logEntries.find(e=>"WEIBO_POST"===e.key&&e.data.postId===K);Z&&(Z.data.text=r.content,r.image&&(Z.data.image=r.image,Z.data.image_type=r.image_type),delete Z.data.content)}break;default:eV(e,r,l);break;case"MOMENT":if(r.momentId=`moment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,"desc"===r.image_type&&r.image&&i(r.momentId,r.image,"moment"),w.addEntry({key:e,data:r}),"user"!==r.author){let Q=C.find(e=>"moments_feed"===e.id);Q&&(Q.unread=(Q.unread||0)+1,eS("moments_feed",r.timestamp))}y=r.momentId}y="MOMENT"===e?r.momentId:null}catch(ee){console.error(`[BLMX Parser] 解析指令 "${e}" 失败:`,ee)}},h=r.split("\n");for(let b of h){if(!b.trim())continue;let v=b.match(/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/),E=b.match(RegExp(`^(${o.join("|")}):(.*)$`));if(E)f(E[1],E[2]);else if(v){let I=v[1],$=v[2].trim(),L=v[3].trim(),k=L;k.startsWith("[")&&k.endsWith("]")&&(k=k.slice(1,-1).trim());let D=RegExp(`^(${o.join("|")}):\\s*(\\{.*\\})$`),A=k.match(D);A?(console.log(`[BLMX Parser] 拦截到聊天内嵌指令: ${A[1]}`),f(A[1],A[2])):e4(L,$,I)}else{let M=b.match(RegExp(`(${o.join("|")}):(\\{.*\\})`));M&&(console.log(`[BLMX Parser] 触发救急匹配 (格式错乱): ${M[1]}`),f(M[1],M[2]))}}if(g>0&&u[g-1]){let N=u[g-1];window.currentGameDate=new Date(N.replace(" ","T"))}await w.persistLogToStorage(),e3(),d.weiboFeed.classList.contains("active")&&n&&eD(n),d.wechatChat.classList.contains("active")&&e$(T),d.moments.classList.contains("active")&&eB(S),d.diaryEntry.classList.contains("active")&&ep("diaryEntry",{ownerId:document.getElementById("diary-entry-view").dataset.ownerId}),eq(),ts(),tc(),el()}async function as(e){if(b){await showDialog({mode:"alert",text:"AI正在为其他事情忙碌，请稍后再来催更。"});return}console.log(`[Profile Posts] Triggering post creation for character: ${e}`),b=!0,eX();try{let t=function e(t){let a=_.find(e=>e.id===t);if(!a)return console.error(`[AI Context] 无法为 ${t} 创建发帖上下文，角色不存在。`),null;let i=au(),n=i.map(e=>`- 【${e.title}】(ID: ${e.id})`).join("\n"),l=`
[任务：角色自主创作与发布]

* **核心身份**: 你现在是 **${ed(t,null)} (ID: ${t})**。

* **你的任务**:
基于你完整的人设、记忆和当前心境，构思并撰写 **三篇** 你此刻最想发的帖子。

* **【最高准则：绝对自由与人设驱动】**:
1. **主题自由**: 这三篇帖子的主题、内容、长度和情绪完全由你决定。它可以是关于工作的抱怨、生活中的小确幸、对某个事件的看法，甚至是无厘头的胡思乱想。
2. **人设驱动**: 你的每一篇帖子都必须是你这个角色会发出来的内容。思考一下：以你的性格，你会选择在哪个分区说话？你会用什么样的语气？你会关心什么样的话题？
3. **分区选择**: 你必须从下方的“可用分区菜单”中，为你的每一篇帖子选择一个最合适的分区。

* **可用分区菜单**:
${n}

[技术要求：输出格式]
你的回复中 **只能包含** “WEIBO_POST”指令，每一条指令占一行，总共三行。严禁任何额外的解释或说明。

* **指令格式**:
\`WEIBO_POST:{"author":"${t}","category":"分区ID","title":"帖子标题","text":"正文","timestamp":"YYYY-MM-DDTHH:mm","image":"图片URL或描述","image_type":"url或desc"}\`

* **字段要求**:
* \`author\`: 必须是 \`${t}\`。
* \`category\`: 必须从上方的“分区菜单”中选择一个有效的ID。
* \`title\`: 吸引人的帖子标题，可包含类型前缀如 [求助]。
* \`text\`, \`timestamp\`: 必须包含符合人设的内容。
* **@提及** 和 **#标签**: 你可以在 \`text\` 字段中使用 \`@角色名\` 和 \`#话题\` 格式。
* **图片 (可选)**: 如需配图，你 **必须** 在JSON中提供 \`image\` 和 \`image_type\` 两个字段。
* \`image_type\`: 必须是 \`"url"\` (图片链接) 或 \`"desc"\` (图片描述) 中的一个。
* \`image\`: 存放对应的URL或描述文本。
* 如果不配图，请不要包含这两个字段。

* **【带图示例】**:
\`WEIBO_POST:{"author":"${t}","category":"life","title":"下午茶","text":"心情不错。 #日常","timestamp":"2025-08-17T15:30","image":"一杯拉花漂亮的拿铁咖啡。","image_type":"desc"}\`

[你的指令]
现在，请以 **${ed(t,null)}** 的身份，开始你的创作。
`;return l.trim()}(e);if(!t)throw Error("无法为AI生成有效的发帖上下文。");N=t,await showDialog({mode:"alert",text:`正在激发 ${ed(e,null)} 的创作灵感，请稍候...`});let a=await v({user_input:t,should_stream:!1});(M=a.trim())?(await ao(M),await showDialog({mode:"alert",text:`${ed(e,null)} 发布了新的动态！`})):await showDialog({mode:"alert",text:"角色似乎没有什么想说的。"})}catch(i){console.error("[Profile Posts] AI post creation failed:",i),await showDialog({mode:"alert",text:`催更失败: ${i.message}`})}finally{b=!1,eX();let n=document.getElementById("forum-profile-view"),l=n.querySelector(".profile-name").textContent,r=eo(l);if(r&&r.id===e){await eC(e);let o=n.querySelector(".profile-tabs"),s=n.querySelector(".profile-tab-content");o.querySelectorAll(".tab-item").forEach(e=>e.classList.remove("active")),s.querySelectorAll(".profile-tab-content > div").forEach(e=>e.classList.remove("active")),o.querySelector('.tab-item[data-tab="posts"]').classList.add("active"),s.querySelector("#profile-tab-posts").classList.add("active")}}}async function ad(e){if(b){console.warn("[BLMX Forum] AI is already generating. Aborting initial feed generation.");return}console.log(`[BLMX Forum] Triggering initial feed generation for category: ${e}`),b=!0,eX();let t=function e(t){let a=document.querySelector(`.weibo-zone-card[data-category="${t}"] .zone-title`).textContent,i=ej(t),n=`
[任务: 论坛初始内容生成]

* **核心身份**: 你的身份是“论坛生态模拟引擎”。你的任务是为【${a}】这个全新的分区，生成第一批帖子，营造出社区已经开始活跃的氛围。

* **环境参考**: 请严格参考下方的“社区圣经”，确保你生成的帖子标题和作者身份都符合该分区的定位和用户画像。
${i}

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
现在，请严格遵循以上格式和示例，为【${a}】分区生成初始的帖子列表。`;return n.trim()}(e);if(!t){b=!1,eX();return}N=t;try{let a=await v({user_input:t,should_stream:!1});(M=a.trim())&&await ao(M,{contextCategory:e})}catch(i){console.error("[BLMX Forum] AI initial feed generation failed:",i),await showDialog({mode:"alert",text:`AI生成初始帖子列表失败: ${i.message}`})}finally{b=!1,eX()}}async function ac(e){if(b){console.warn("[BLMX Forum] AI is already generating. Aborting full post generation.");return}let t=O.posts.find(t=>t.postId===e);if(!t)return;console.log(`[BLMX Forum] Triggering full post generation for postId: ${e}`),b=!0,eX();let a=function e(t){let a=O.posts.find(e=>e.postId===t);if(!a)return console.error(`[BLMX Forum] 无法为帖子 ${t} 创建上下文，帖子未找到。`),null;let i=document.querySelector(`.weibo-zone-card[data-category="${a.category}"] .zone-title`).textContent,n=ej(a.category),l="",r="";"fanfic"===a.category?(l="正文若为有情节、有细节的短篇故事或章节请适量长一点，若为CP讨论或社交可以适量短一点。",r=`* **【正文内容核心要求】**:
* **分段要求**: 正文内容 **必须** 包含至少2-3个自然段落，段落之间使用 **一个换行符 (\\n)** 分隔。`):(l="正文内容应简洁明了，抓住核心，模拟真实社交平台的快节奏分享。建议长度在0-200字符之间。",r="");let o=`
[任务: 活化这个帖子]

* **【最高优先级：核心禁令】**:
1. **人设严格遵守 (OOC禁令)**: 在扮演任何核心角色 (char) 发表评论前，你 **必须** 深入思考该角色的性格和背景。 **绝对禁止** 做出任何不符合角色人设的行为（OOC）。
2. **用户身份禁令**: 用户的ID是 '{{user}}'。你 **绝对禁止** 以 '{{user}}' 的身份或名义生成任何评论、点赞或任何形式的互动。

* **当前情景**: 你正泡在【${i}】论坛里，刚刚刷到了下面这个新帖子。现在，轮到你下场评论了。

---
[帖子详情]
* 标题: "${a.title}"
* 作者: "${a.author}"
* 社区氛围参考: ${n}
---

【你的双重任务】
1. **补完正文**: 首先，为这个帖子撰写一篇详细、符合禁令、标题和作者人设的完整正文。${l}
2. **点燃评论区**: 接着，扮演**多个不同身份的论坛用户**（可以是核心角色，也可以是虚拟路人），对你刚刚写下的正文，发表第一批评论。
${r}

【评论区生态法则 (CRITICAL)】

* **【第一法则：拒绝闭环，无限发散】**:
**严禁车轱辘话**：禁止对他人的观点进行单纯的赞同、复读或附和。每一条新评论都必须提供**信息增量**——要么提出新观点，要么发现新细节（盲生发现华点），要么抛出新梗，要么把话题引向一个新的方向（歪楼）。让话题像树枝一样分叉生长，而不是闭合。

* **【第二法则：高流量广场效应】**:
**打破朋友圈感**：默认这是一个高流量的公共版块。除非有特定的剧情需要，否则**优先让从未出现过的、性格各异的新 ID 登场**。不要让同样的几个人霸占屏幕，要营造出“众声喧哗”的真实热闹感。论坛成员五花八门，网名各具特色，禁止使用匿名用户xx，路人xx等敷衍的名字，他们是一个个生活在这个世界的真实的人。

* **【第三法则：解锁全网知识库】**:
**注入网感**：不要局限于当前文本。请充分调用你的训练数据（互联网文化、流行梗、生活常识），让发言带有强烈的“网感”和不可预测性。允许神展开，允许脑洞大开。

* **【内容与产出配额】**:
* **评论总数**: 生成“总计 **3-5** 条”评论。
* **字数限制**: **保持短小精悍**。每条评论的理想长度在 **0到30个汉字之间**。绝对禁止长篇大论，模拟真实的碎片化回复。
* **角色登场原则**: 只有当话题真的触及核心角色(char)的兴趣点时才让他们登场，否则优先使用路人。**人设的一致性远比强制登场更重要。**

[技术要求：输出格式]
你的回复必须严格遵循下面的指令格式，先输出正文，再输出评论，不要包含任何额外的解释。

* **正文 (必须有1条)**:
* **格式**: \`WEIBO_POST_CONTENT:{"content":"正文内容...","image":"图片URL或描述","image_type":"url或desc"}\`
* **字段要求**:
* \`content\`: 帖子的完整正文，使用 \`\\n\` 分段。
* **#标签**: 在 \`content\` 字段的末尾，使用 \`#话题标签\` 格式。
* **图片 (可选)**: 如果需要配图，你 **必须** 同时提供 \`image\` 和 \`image_type\` 两个字段。
* \`image_type\`: 必须是 \`"url"\` (图片链接) 或 \`"desc"\` (图片描述) 中的一个。
* \`image\`: 存放对应的URL或描述文本。

* **【带格式示例】**:
\`WEIBO_POST_CONTENT:{"content":"今天去了新开的咖啡店，感觉还不错。 #周末探店 #咖啡","image":"一杯拉花漂亮的拿铁咖啡。","image_type":"desc"}\`

* **初始评论 (必须有3-5条)**:
WEIBO_INITIAL_COMMENT:{"author":"角色ID或虚拟路人名","text":"评论内容"}

[你的指令]
现在，请沉浸到这个论坛里，严格遵循以上所有规则，开始你的创作。`;return o.trim()}(e);if(!a){b=!1,eX();return}N=a,await showDialog({mode:"alert",text:"AI正在撰写帖子内容和评论，请稍候..."});try{let i=await v({user_input:a,should_stream:!1});(M=i.trim())&&await ao(M,{contextCategory:t.category,contextPostId:e})}catch(n){console.error("[BLMX Forum] AI full post generation failed:",n),await showDialog({mode:"alert",text:`AI生成帖子内容失败: ${n.message}`})}finally{b=!1,eX()}}async function am(e){if(b||!w||!v){console.warn("[BLMX Weibo] AI is already generating or essential functions are missing. Aborting.");return}console.log(`[BLMX Weibo] Triggering AI response for post: ${e}`),b=!0,eX();let t=function e(t){let a=O.posts.find(e=>e.postId===t);if(!a)return null;let i=`
* **【最高优先级：核心禁令】**:
1. **人设严格遵守 (OOC禁令)**: 在扮演任何核心角色 (char) 发表评论前，你 **必须** 深入思考该角色的性格和背景。 **绝对禁止** 做出任何不符合角色人设的行为（OOC）。
2. **用户身份禁令**: 用户的ID是 '{{user}}'。你 **绝对禁止** 以 '{{user}}' 的身份或名义生成任何评论、点赞或任何形式的互动。`,n=ej(a.category),l=`

[社区氛围参考]
${n}`,r=`

[当前情景与上下文]
你正在浏览下面这个帖子的最新回复：
`,o=a.title||a.text.match(/^【([^】]+)】/)?.[1]||a.text.substring(0,30);r+=`* **原帖 (作者: ${ed(a.author,null)})**: "${o}"

`;let s=O.comments[t]||[];if(s.length>0){let d=s.slice(-5);r+=`* **最新评论** (按时间顺序):
`;let c=/\[引用:"(?:.|\n)*?"\]\s*/;d.forEach(e=>{let t=e.author===A.id||"user"===e.author||"{{user}}"===e.author?"{{user}}":ed(e.author,null),a=(e.text||"").replace(c,"");r+=`* [作者: ${t}]: ${a}
`})}else r+=`* **最新评论**: 当前暂无评论。
`;let m=`

【你的任务：点燃评论区】
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
* **角色登场原则**: 只有当话题真的触及核心角色(char)的兴趣点时才让他们登场，否则优先使用路人。**人设的一致性远比强制登场更重要。**`,p=`

【技术要求：输出格式】
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
`,u=(i+l+r+m+p).trim();return u}(e);if(!t){b=!1,eX();return}N=t;try{let a=await v({user_input:t,should_stream:!1});M=a.trim(),a&&await ao(a,{contextPostId:e})}catch(i){console.error("[BLMX Weibo] AI generation failed:",i),await showDialog({mode:"alert",text:`微博AI响应失败: ${i.message}`})}finally{b=!1,eX(),console.log(`[BLMX Weibo] AI response cycle finished for post: ${e}`)}}function ap(e){let t=e.filter(e=>"user"!==e&&"{{user}}"!==e),a=[...t].sort();return`convo_group_${a.join("-")}`}function au(){let e=`blmx_weibo_zones_${k}`,t=localStorage.getItem(e);try{if(t)return JSON.parse(t)}catch(a){console.error(`[BLMX Weibo Zones] Failed to parse zones data from localStorage for key ${e}:`,a)}return[]}function ag(e){let t=`blmx_weibo_zones_${k}`;try{let a=JSON.stringify(e);localStorage.setItem(t,a)}catch(i){console.error(`[BLMX Weibo Zones] Failed to save zones data to localStorage for key ${t}:`,i)}}function ay(){let e=document.querySelector("#weibo-view .weibo-zone-list-container");if(!e){console.error("[BLMX Weibo] Render failed: Cannot find zone list container element.");return}let t=au();t.sort((e,t)=>t.isPinned-e.isPinned||e.order-t.order),e.innerHTML="",t.forEach(t=>{let a=document.createElement("div");a.className=`weibo-zone-card zone-${t.id}`,a.dataset.category=t.id,t.isDefault||(a.style.backgroundColor=t.color),a.innerHTML=`
<div class="zone-status-indicator">
	<i class="fas fa-heart"></i>
</div>
<div class="zone-text-content">
	<h2 class="zone-title">${t.title}</h2>
	<p class="zone-subtitle">${t.subtitle}</p>
</div>
`,ex(a,e=>(function e(t,a){let i=document.querySelector(".context-menu");i&&i.remove();let n=document.querySelector(".context-menu-backdrop");n&&n.remove();let l=au(),r=l.find(e=>e.id===t);if(!r){console.error(`[Context Menu] Cannot find zone with id: ${t}`);return}let o=document.createElement("div");o.className="context-menu";let s="",d=r.isPinned?"取消置顶":"置顶分区";s+=`<div class="context-menu-item" data-action="pin">${d}</div>`,r.isDefault?s+=`<div class="context-menu-item" data-action="hide">从主页移除</div>`:(s+=`<div class="context-menu-item" data-action="edit">编辑分区</div>`,s+=`<div class="context-menu-item" data-action="delete" style="color:red;">彻底删除</div>`),o.innerHTML=s;let c=document.createElement("div");c.className="context-menu-backdrop",document.body.appendChild(c),document.body.appendChild(o);let m=a.type.includes("touch")?a.touches[0].clientX:a.clientX,p=a.type.includes("touch")?a.touches[0].clientY:a.clientY;o.style.left=`${m}px`,o.style.top=`${p}px`;let u=()=>{o.remove(),c.remove()};c.addEventListener("click",u),o.addEventListener("click",async e=>{let a=e.target.dataset.action;"pin"===a?function e(t){let a=au(),i=a.find(e=>e.id===t);if(!i){console.error(`[Pin Zone] Action failed: Cannot find zone with id: ${t}`);return}i.isPinned=!i.isPinned,ag(a),ay()}(t):"edit"===a?await aw(t):"delete"===a?await av(t):"hide"===a&&await ab(t),u()})})(t.id,e)),a.addEventListener("click",async()=>{let e=await showDialog({mode:"confirm",text:`是否要查看【${t.title}】分区？`});if(e){let a=O.posts.filter(e=>e.category===t.id);ep("weiboFeed",{category:t.id,categoryName:t.title}),eD(t.id),0===a.length&&await ad(t.id)}}),e.appendChild(a)}),eN()}function af(e){return new Promise(t=>{let a=document.getElementById("custom-dialog-modal"),i=document.getElementById("dialog-text"),n=document.getElementById("dialog-buttons");i.innerHTML="",n.innerHTML="",document.getElementById("dialog-input").style.display="none";let l=document.createElement("h3");l.textContent=e.title,l.style.marginTop="0",l.style.textAlign="center",i.appendChild(l);let r=document.createElement("div");r.style.textAlign="left",e.fields.forEach(e=>{let t=document.createElement("div");t.style.marginBottom="1rem",t.style.display="flex",t.style.justifyContent="space-between",t.style.alignItems="center";let a=document.createElement("label");if(a.textContent=e.label,a.style.fontWeight="500",t.appendChild(a),"switch"===e.type){let i=document.createElement("label");i.className="blmx-switch";let n=document.createElement("input");n.type="checkbox",n.id=`dialog-input-${e.id}`,n.checked=e.defaultValue||!1;let l=document.createElement("span");l.className="blmx-slider",i.appendChild(n),i.appendChild(l),t.appendChild(i)}else if("slider"===e.type){let o=document.createElement("div");o.className="control-wrapper",o.style.display="flex",o.style.alignItems="center",o.style.gap="0.5rem";let s=document.createElement("input");s.type="range",s.id=`dialog-input-${e.id}`,s.min=e.min||0,s.max=e.max||100,s.step=e.step||1,s.value=e.defaultValue||50,s.style.width="6rem";let d=document.createElement("span");d.className="range-value",d.textContent=`${s.value}${e.unit||""}`,d.style.width="3.5rem",d.style.textAlign="right",s.addEventListener("input",()=>{d.textContent=`${s.value}${e.unit||""}`}),o.appendChild(s),o.appendChild(d),t.appendChild(o)}else{t.style.flexDirection="column",t.style.alignItems="flex-start",a.style.marginBottom="0.25rem";let c;"textarea"===e.type?((c=document.createElement("textarea")).rows=5,c.style.resize="vertical"):"color"===e.type?((c=document.createElement("input")).type="color",c.style.cssText="width: 100%; height: 2.5rem; padding: 0.25rem; border: 1px solid var(--border-color); border-radius: 0.375rem; cursor: pointer;"):(c=document.createElement("input")).type="text",c.id=`dialog-input-${e.id}`,c.value=e.defaultValue||"",e.type,t.appendChild(c)}r.appendChild(t)}),i.appendChild(r);let o=document.createElement("button");o.textContent="确定",o.className="primary";let s=document.createElement("button");s.textContent="取消",s.className="secondary",n.appendChild(s),n.appendChild(o);let d=e=>{a.style.display="none",n.innerHTML="",i.innerHTML="",t(e)};s.onclick=()=>d(null),o.onclick=()=>{let t={};e.fields.forEach(e=>{let a=document.getElementById(`dialog-input-${e.id}`);"checkbox"===a.type?t[e.id]=a.checked:t[e.id]="range"===a.type?parseFloat(a.value):a.value}),d(t)},a.style.display="flex"})}function ah(e){return new Promise(t=>{let a=document.getElementById("custom-dialog-modal"),i=document.getElementById("dialog-text"),n=document.getElementById("dialog-buttons");i.textContent=e.text||"",n.innerHTML="",document.getElementById("dialog-input").style.display="none";let l=e=>{a.style.display="none",n.innerHTML="",t(e)},r=document.createElement("button");r.textContent=e.buttons[0],r.className="primary",r.onclick=()=>l(e.buttons[0]);let o=document.createElement("button");o.textContent=e.buttons[1],o.className="primary",o.onclick=()=>l(e.buttons[1]);let s=document.createElement("button");s.textContent=e.buttons[2],s.className="secondary",s.onclick=()=>l(null),n.appendChild(r),n.appendChild(o),n.appendChild(s),a.style.display="flex"})}async function ab(e){let t=await showDialog({mode:"confirm",text:"确定要从主页移除这个分区吗？\n（之后可以从“添加”中恢复）"});if(!t)return;let a=au(),i=a.filter(t=>t.id!==e);ag(i),ay()}async function av(e){let t=await showDialog({mode:"confirm",text:"【警告】\n确定要彻底删除这个自定义分区吗？\n\n此操作不可恢复！"});if(!t)return;let a=au(),i=a.filter(t=>t.id!==e);ag(i),ay()}async function aw(e){let t=au(),a=t.find(t=>t.id===e);if(!a||a.isDefault){console.error(`[Edit Zone] Action failed: Cannot find or edit zone with id: ${e}`),await showDialog({mode:"alert",text:"无法编辑此分区。"});return}let i=await af({title:"编辑自定义分区",fields:[{id:"title",label:"分区标题",defaultValue:a.title},{id:"subtitle",label:"分区副标题",defaultValue:a.subtitle},{id:"color",label:"颜色",type:"color",defaultValue:a.color},{id:"communityBible",label:"社区圣经 (用于AI生成内容的Prompt)",type:"textarea-readonly-prefix",prefix:"【社区圣经】",defaultValue:a.communityBible}]});i&&(a.title=i.title.trim(),a.subtitle=i.subtitle.trim(),a.color=i.color,a.communityBible=i.communityBible,ag(t),ay(),await showDialog({mode:"alert",text:"分区信息已更新！"}))}async function aE(){let e=au(),t=s.filter(t=>!e.some(e=>e.id===t.id)),a=document.getElementById("custom-dialog-modal");document.getElementById("custom-dialog-box");let i=document.getElementById("dialog-text"),n=document.getElementById("dialog-buttons");if(i.innerHTML="",n.innerHTML="",i.innerHTML='<h3 style="margin-top:0; text-align:center;">添加分区</h3>',t.length>0){i.innerHTML+='<h4 style="margin-bottom: 0.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.3rem;">恢复默认分区</h4>';let l=document.createElement("div");l.style.cssText="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;",t.forEach(e=>{let t=document.createElement("button");t.textContent=`+ ${e.title}`,t.style.cssText=`background-color: ${e.color}; color: white; border: none; padding: 0.5rem 0.8rem; border-radius: 1rem; cursor: pointer;`,t.dataset.action="restore",t.dataset.zoneId=e.id,l.appendChild(t)}),i.appendChild(l)}i.innerHTML+='<h4 style="margin-bottom: 0.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.3rem;">创建新分区</h4>';let r=document.createElement("button");r.textContent="创建自定义分区",r.className="primary",r.style.width="100%",r.dataset.action="create",i.appendChild(r);let o=document.createElement("button");o.textContent="关闭",o.className="secondary",n.appendChild(o);let d=async e=>{let t=e.target.closest("button[data-action]");if(!t)return;let a=t.dataset.action;if("restore"===a){let i=t.dataset.zoneId;(function e(t){let a=JSON.parse(JSON.stringify(s.find(e=>e.id===t)));if(!a){console.error(`[Restore Zone] Action failed: Cannot find default zone with id: ${t}`);return}let i=au();i.push(a),ag(i),ay()})(i),c()}else"create"===a&&(await aI(),c())},c=()=>{a.style.display="none",i.removeEventListener("click",d)};o.onclick=c,i.addEventListener("click",d),a.style.display="flex"}async function aI(){let e=await af({title:"创建自定义分区",fields:[{id:"title",label:"分区标题",defaultValue:""},{id:"subtitle",label:"分区副标题",defaultValue:""},{id:"color",label:"分区颜色",type:"color",defaultValue:"#b8c4bb"},{id:"communityBible",label:"社区圣经 (用于AI生成内容的Prompt)",type:"textarea-readonly-prefix",prefix:"【社区圣经】",defaultValue:"请在此处填写你的设定\n* 社区定位: \n* 核心议题: \n* 用户画像: \n* 核心任务: "}]});if(!e)return;if(!e.title.trim()){await showDialog({mode:"alert",text:"分区标题不能为空！"});return}let t=au(),a=`custom_${Date.now()}`,i={id:a,title:e.title.trim(),subtitle:e.subtitle.trim(),color:e.color,communityBible:e.communityBible,isDefault:!1,isPinned:!1,order:Date.now()};t.push(i),ag(t),ay(),await showDialog({mode:"alert",text:"新分区已成功创建！"})}function ax(){let e={"--app-icon-wechat-image":"app-wechat","--app-icon-settings-image":"app-settings","--app-icon-check-phone-image":"app-check-phone","--app-icon-weibo-image":"app-weibo","--app-icon-diary-image":"app-diary","--app-icon-font-image":"app-font-studio","--app-icon-workshop-image":"app-bubble-workshop","--app-icon-studio-image":"app-global-studio"},t=`blmx_global_theme_${k}`,a=localStorage.getItem(t),i=a?JSON.parse(a):{};for(let n in e){let l=e[n],r=document.getElementById(l)?.querySelector(".icon-image");if(r){let o=i[n];o&&o.trim()?r.style.backgroundImage=`url('${o.trim()}')`:r.style.backgroundImage=""}}}async function a9(){try{console.log("[BLMX] Fetching SillyTavern info...");let e=window.parent,t=await e.TavernHelper.getCharData();k=t.name,er()}catch(a){console.error("[BLMX] Failed to auto-load info from SillyTavern:",a),k="default_char",er()}!function e(){let t={"--wallpaper-home":"blmx_wallpaper_home_url","--wallpaper-chat":"blmx_wallpaper_chat_url","--wallpaper-diary-cover":`blmx_diary_cover_${k}`},a=`blmx_global_theme_${k}`,i=localStorage.getItem(a),n=i?JSON.parse(i):{},l=!1;for(let r in t){let o=t[r],s=localStorage.getItem(o);s&&(n[r]=s,localStorage.removeItem(o),l=!0,console.log(`[Theme Migration] Migrated '${o}' to global theme.`))}l&&(localStorage.setItem(a,JSON.stringify(n)),console.log("[Theme Migration] Migration complete. New global theme saved."))}();let l=au();0===l.length&&(console.log(`[BLMX Weibo Zones] No custom zones found for ${k}. Initializing with defaults.`),ag(s)),v=window.parent.TavernHelper.generate,w=new BLMX_Protocol(window.parent.TavernHelper,k);let r=localStorage.getItem(`blmx_hub_custom_text_${k}`),o=document.querySelector(".widget-custom-text");o&&r&&(o.textContent=r),await w.initialize(),e3(),function e(){let t=!1,a={};C.forEach(e=>{if("group"===e.type&&/_(\d{13})$/.test(e.id)){let i=e.id,n=ap(e.members);a[i]=n,e.id=n,t=!0,console.log(`[BLMX ID Migration] Planning to migrate ${i} -> ${n}`)}}),t?(console.log("[BLMX ID Migration] Starting migration of log entries..."),w.logEntries.forEach(e=>{let t=e.conversationId||e.convoId||e.content&&e.content.convoId;t&&a[t]&&(e.conversationId&&(e.conversationId=a[t]),e.convoId&&(e.convoId=a[t]),e.content&&e.content.convoId&&(e.content.convoId=a[t]),e.data&&e.data.convoId&&(e.data.convoId=a[t]))}),console.log("[BLMX ID Migration] Migration complete. Saving changes."),el(),w.persistLogToStorage()):console.log("[BLMX ID Migration] No old numeric group IDs found. No migration needed.")}(),w.logEntries.forEach(e=>{if(e.conversationId||e.convoId||!e.sender)return;let t=e.sender;if("user"===t)return;let a=C.filter(e=>e.members.includes(t));if(1===a.length)e.conversationId=a[0].id;else if(a.length>1){let i=a.find(e=>"single"===e.type);e.conversationId=i?i.id:a[0].id}else console.warn(`[BLMX History] Could not find a conversation for old log entry from sender '${t}'.`)}),console.log("[BLMX] Finished assigning conversations to historical logs."),f.innerHTML=`
            <div class="features-grid active" id="plus-grid-page1"></div>
            <div class="features-grid" id="plus-grid-page2" style="display:none;"></div>
            <div class="panel-pagination">
                <div class="panel-dot active" data-page="1"></div>
                <div class="panel-dot" data-page="2"></div>
            </div>`,tn(f.querySelector("#plus-grid-page1"),te),tn(f.querySelector("#plus-grid-page2"),tt),f.querySelectorAll(".panel-dot").forEach(e=>{e.addEventListener("click",e=>{let t=e.target.dataset.page;f.querySelectorAll(".features-grid").forEach(e=>e.style.display="none"),f.querySelector(`#plus-grid-page${t}`).style.display="grid",f.querySelectorAll(".panel-dot").forEach(e=>e.classList.remove("active")),e.target.classList.add("active")})}),tn(g,eZ.get()),function e(){document.getElementById("app-check-phone").addEventListener("click",async()=>{console.log("[CheckPhone] App clicked!");let e=document.getElementById("diary-owner-modal"),t=e.querySelector(".title"),a=e.querySelector(".diary-owner-list-container"),i=e.querySelector(".close-btn"),n=t.textContent;t.textContent="查看谁的手机？";let l=await new Promise(l=>{let r=a.cloneNode(!1);a.parentNode.replaceChild(r,a);let o=a=>{e.style.display="none",t.textContent=n,l(a)};_.forEach(e=>{let t=document.createElement("div");t.className="diary-owner-list-item",t.innerHTML=`
<img src="${ec(e.id)}" alt="${e.name}">
<span>${ed(e.id,null)}</span>
`,t.addEventListener("click",()=>o(e.id)),r.appendChild(t)}),i.onclick=()=>o(null),e.style.display="flex"});if(l){B=l;let r=ed(l,null);document.getElementById("check-phone-title").textContent=`${r}的手机`,ep("checkPhone")}}),document.getElementById("check-phone-back-btn").addEventListener("click",()=>{B=null,ep("home")}),document.querySelector(".check-phone-grid").addEventListener("click",e=>{let t=e.target.closest(".cp-app-item");if(t){let a=t.dataset.app;if("footprints"===a)!function e(){let t=B;if(!t)return;ep("footprints");let a=[...w.logEntries].reverse().find(e=>"footprints"===e.type&&e.author===t);if(a)t2(a.content);else{let i=document.getElementById("cp-footprints-list");document.querySelector(".fp-map-header").innerHTML="",i.innerHTML=`
<div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--text-color-tertiary); gap:1rem; margin-top:3rem;">
	<i class="fas fa-shoe-prints" style="font-size:3rem; opacity:0.3;"></i>
	<p style="margin:0;">今日暂无足迹</p>
	<button id="manual-gen-footprints-btn" class="studio-btn primary" style="font-size:0.85em; padding:0.4rem 1rem;">
		<i class="fas fa-satellite-dish"></i> 生成今日轨迹
	</button>
</div>
`;let n=document.getElementById("manual-gen-footprints-btn");n&&n.addEventListener("click",()=>tF(t))}}();else if("gallery"===a){let i=B;if(!i)return;ep("gallery"),t4(i)}else if("shopping"===a){let n=B;if(!n)return;ep("shoppingHome")}else{let l=t.querySelector(".cp-app-name").textContent;showDialog({mode:"alert",text:`正在打开 [${l}] ...
(功能开发中)`})}}});let t=document.getElementById("shopping-home-feed");t&&t.addEventListener("click",e=>{let t=e.target.closest(".tb-product-card");if(!t||e.target.classList.contains("tb-img-placeholder-text"))return;let a=t.querySelector("img"),i=a?a.src:null,n=t.querySelector(".tb-img-placeholder-text"),l={title:t.querySelector(".tb-product-title").textContent,price:t.querySelector(".tb-price-num").textContent,shop:t.querySelector(".tb-sales").textContent,image:n?n.dataset.fullText:a?a.src:"",_imgBlobUrl:i};ep("productDetail"),ar(l)}),document.getElementById("tb-detail-back-btn").addEventListener("click",()=>{ep("shoppingHome")}),document.getElementById("tb-detail-add-cart").addEventListener("click",()=>{tQ()}),document.getElementById("tb-detail-buy-now").addEventListener("click",async()=>{if(!L)return;let e=B;if(!T&&e){let t=C.find(t=>"single"===t.type&&t.members.includes(e));t||(t={id:`convo_single_${e}`,type:"single",members:["user",e],unread:0,pinned:!1,lastActivity:Date.now()},C.push(t)),T=t.id}if(!T){await showDialog({mode:"alert",text:"错误：无法确定分享目标，请先进入一个聊天窗口或选择查看对象的手机。"});return}let a=await showDialog({mode:"confirm",text:"确定要立即购买并分享给对方吗？"});if(a){let i={title:L.title,price:L.price,image:L.image,shop:L.shop};e1({type:"product_share",sender:"me",content:i}),await showDialog({mode:"alert",text:"商品已分享！"}),ep("wechatChat",{conversationId:T})}});let a=document.querySelector(".tb-clear-home-btn");a&&a.addEventListener("click",async()=>{let e=B;if(!e)return;let t=await showDialog({mode:"confirm",text:"确定要清空当前的商品推荐流吗？\n清空后可点击刷新按钮重新生成。"});t&&(w.logEntries=w.logEntries.filter(t=>!("taobao_home"===t.type&&t.author===e)),await w.persistLogToStorage(),an(e),await showDialog({mode:"alert",text:"推荐流已清空。"}))}),document.getElementById("cp-shopping-manage-btn").addEventListener("click",()=>{ae()});let l=document.getElementById("nav-to-home-from-cart");l&&l.addEventListener("click",()=>{ep("shoppingHome")});let r=document.getElementById("nav-to-cart");r&&r.addEventListener("click",()=>{let e=B;e&&(ep("shopping"),at(e))}),document.getElementById("cp-shopping-back-btn"),document.querySelector(".tb-scan-icon").addEventListener("click",()=>{ep("checkPhone")}),document.getElementById("cp-shopping-back-btn").addEventListener("click",()=>{ep("shoppingHome")});let o={想去旅行:{name:"想去旅行",instruction:"推荐旅行相关的商品，如机票、酒店套餐、旅行收纳、度假穿搭。根据角色最近是否劳累决定是推荐'特种兵旅游'还是'躺平度假'。"},深夜冲动:{name:"深夜冲动",instruction:"推荐适合深夜下单的商品：高热量夜宵、成人玩具、昂贵的数码产品、情感抚慰用品。侧重于'冲动消费'和'私密欲望'。"},闲置回血:{name:"闲置回血",instruction:"【特殊反向逻辑】推荐角色**想要卖掉**的二手物品。例如：前任送的礼物、不再喜欢的旧物、冲动消费后的后悔药。店铺名显示为'我的闲置'。"},海外代购:{name:"海外代购",instruction:"推荐昂贵的进口商品、奢侈品、或者国内买不到的小众好物。"},健康养生:{name:"健康养生",instruction:"推荐保健品、养生壶、护肝片、防脱发产品。侧重于当代年轻人的'赛博养生'。"},礼物推荐:{name:"礼物推荐",instruction:"角色可能正在考虑给某人（可能是{{user}}，也可能是其他人）买礼物。推荐一些具有送礼属性的精致商品。"},角色穿搭:{name:"角色穿搭",instruction:"基于角色的外貌描写和风格，推荐TA可能会喜欢的衣服、配饰、鞋包。"},宅家必备:{name:"宅家必备",instruction:"推荐提升居家幸福感的好物，游戏机、懒人沙发、零食大礼包、智能家居。"},浏览历史:{name:"浏览历史",instruction:"展示角色最近看过但没买的东西，反映TA的纠结和犹豫。"},全部频道:{name:"猜你喜欢",instruction:"生成一组完全随机、脑洞大开的商品，试图探测角色的潜在兴趣。"}},s=document.querySelector(".tb-icons-grid");s&&s.addEventListener("click",async e=>{let t=e.target.closest(".tb-icon-item");if(!t)return;let a=t.querySelector(".tb-icon-label").textContent.trim(),i=o[a],n=B;if(!n||!i)return;let l=await showDialog({mode:"confirm",text:`进入【${a}】频道？
这会刷新当前的商品推荐流。`});l&&ai(n,null,i)});let g=document.querySelector(".tb-search-btn"),y=document.querySelector(".tb-search-input"),f=async()=>{let e=B;if(!e)return;let t=y.value.trim()||y.placeholder;if(!t||t.includes("...")){await showDialog({mode:"alert",text:"请输入搜索关键词。"});return}let a=await showDialog({mode:"confirm",text:`确定要搜索 "${t}" 吗？
这将刷新首页推荐流。`});a&&(y.value="",ai(e,t))};g&&g.addEventListener("click",f),y&&(y.removeAttribute("readonly"),y.addEventListener("keydown",e=>{"Enter"===e.key&&(e.preventDefault(),f())}));let x=document.getElementById("nav-to-profile");x&&x.addEventListener("click",()=>{ep("shoppingProfile"),al()});let D=document.getElementById("nav-to-profile-from-cart");D&&D.addEventListener("click",()=>{ep("shoppingProfile"),al()});let P=document.getElementById("nav-to-home-from-profile");P&&P.addEventListener("click",()=>{ep("shoppingHome")});let H=document.getElementById("nav-to-cart-from-profile");H&&H.addEventListener("click",()=>{let e=B;e&&(ep("shopping"),at(e))}),document.getElementById("cp-footprints-back-btn").addEventListener("click",()=>{ep("checkPhone")}),document.getElementById("cp-footprints-delete-btn").addEventListener("click",async()=>{let e=B;if(!e)return;let t=await showDialog({mode:"confirm",text:"确定要删除今日的足迹记录吗？\n删除后重新进入即可自动生成新的。"});t&&(w.logEntries=w.logEntries.filter(t=>!("footprints"===t.type&&t.author===e)),await w.persistLogToStorage(),await showDialog({mode:"alert",text:"记录已删除。"}),ep("checkPhone"))}),document.getElementById("cp-gallery-back-btn").addEventListener("click",()=>{ep("checkPhone")}),document.getElementById("cp-gallery-reset-btn").addEventListener("click",async()=>{let e=B;if(!e)return;let t=await showDialog({mode:"confirm",text:"确定要清空“近期回忆”吗？\n\n注意：\n1. 仅清空主相册，不会删除隐藏相册和回收站。\n2. 清空后重新进入可触发AI生成新内容。"});t&&(w.logEntries=w.logEntries.filter(t=>"gallery_update"!==t.type||t.author!==e&&(!t.content||t.content.author!==e)),await w.persistLogToStorage(),await showDialog({mode:"alert",text:"主相册已清空。"}),t4(e))});let R=document.getElementById("folder-hidden");R&&R.addEventListener("click",()=>{ep("hiddenAlbum"),Object.values(d).forEach(e=>e.classList.remove("active")),document.getElementById("cp-hidden-album-view").classList.add("active");let e=B;e&&tX(e)});let U=document.getElementById("folder-trash");U&&U.addEventListener("click",()=>{Object.values(d).forEach(e=>e.classList.remove("active")),document.getElementById("cp-trash-bin-view").classList.add("active");let e=B;e&&tK(e)}),document.getElementById("cp-hidden-back-btn").addEventListener("click",()=>{ep("gallery"),B&&t4(B)}),document.getElementById("cp-trash-back-btn").addEventListener("click",()=>{ep("gallery"),B&&t4(B)}),document.getElementById("cp-trash-clear-all").addEventListener("click",async()=>{let e=await showDialog({mode:"confirm",text:"确定要彻底清空所有废弃项目吗？"});if(e){let t=B;w.logEntries=w.logEntries.filter(e=>!("trash_bin_update"===e.type&&e.author===t)),await w.persistLogToStorage(),tK(t),await showDialog({mode:"alert",text:"垃圾桶已清空。"})}});let G=document.getElementById("cp-hidden-clear-btn");if(G&&G.addEventListener("click",async()=>{let e=B;if(!e)return;let t=await showDialog({mode:"confirm",text:"【警告】\n确定要清空隐藏相册的所有数据吗？此操作不可恢复。"});t&&(w.logEntries=w.logEntries.filter(t=>!("hidden_album_update"===t.type&&t.author===e)),await w.persistLogToStorage(),tX(e),await showDialog({mode:"alert",text:"隐藏空间已重置。"}))}),window._blmxListenersAdded)return;window._blmxListenersAdded=!0;let W=document.getElementById("global-image-viewer-img");W&&ex(W,e=>{e.stopPropagation(),W.src&&window.downloadImage(W.src)});let j,F=()=>clearTimeout(j);document.body.addEventListener("pointerup",F),document.body.addEventListener("pointerleave",F),document.body.addEventListener("pointercancel",F),document.body.addEventListener("click",e=>{e.target.matches(".nai-generated-image, .post-media-image, .image-url-bubble img")&&(e.stopPropagation(),n(e.target.src))},!0);let X=document.querySelector(".widget-custom-text");X&&X.addEventListener("click",async()=>{let e=X.textContent,t=await showDialog({mode:"prompt",text:"设置主屏幕自定义短语:",defaultValue:e});if(null!==t){let a=t.trim()||"风吹向海 我吹响自由";X.textContent=a,localStorage.setItem(`blmx_hub_custom_text_${k}`,a),await showDialog({mode:"alert",text:"短语已更新！"})}}),document.getElementById("app-listen-together").addEventListener("click",()=>{ep("listenTogether")}),document.getElementById("lt-back-btn").addEventListener("click",()=>{ep("home")}),document.getElementById("lt-center-stage").addEventListener("click",function(){this.classList.toggle("show-lyrics")}),document.getElementById("lt-options-btn").addEventListener("click",()=>{tS()}),document.getElementById("lt-char-avatar").addEventListener("click",()=>{t0()});let K=document.querySelector(".lt-action-bar .fa-share-alt");K&&K.addEventListener("click",async()=>{let e={title:currentSong.title,artist:currentSong.artist,cover:A.avatar||"https://files.catbox.moe/bialj8.jpeg",src:currentSong.src,lrc:currentSong.lrc};ak(e,"shareMusic")});let J=document.querySelector(".lt-action-bar .fa-download"),Z=document.getElementById("lt-playlist-overlay"),et=document.getElementById("lt-playlist-close-btn"),ea=document.getElementById("lt-add-to-playlist-btn");J&&Z&&(J.addEventListener("click",()=>{tG(),Z.style.display="flex",setTimeout(()=>{Z.style.opacity="1"},10)}),et.addEventListener("click",()=>{Z.style.opacity="0",setTimeout(()=>{Z.style.display="none"},300)}),Z.addEventListener("click",e=>{e.target===Z&&(Z.style.opacity="0",setTimeout(()=>{Z.style.display="none"},300))}),ea.addEventListener("click",async()=>{if(!currentSong||!currentSong.src){await showDialog({mode:"alert",text:"当前没有正在播放的歌曲。"});return}let e=await t1(currentSong);e&&(await showDialog({mode:"alert",text:`《${currentSong.title}》已加入歌单！`}),tG())})),document.getElementById("lt-mode-btn").addEventListener("click",tj),document.getElementById("lt-prev-btn").addEventListener("click",()=>{tY("prev",!1)}),document.getElementById("lt-next-btn").addEventListener("click",()=>{tY("next",!1)});let ei=document.getElementById("lt-playlist-toggle-btn");ei&&ei.addEventListener("click",()=>{tG()});let er=document.querySelector(".lt-action-bar .fa-heart");er&&er.addEventListener("click",function(){this.classList.contains("far")?(this.classList.replace("far","fas"),this.style.color="#E14438",this.style.transform="scale(1.2)",setTimeout(()=>{this.style.transform="scale(1)"},200)):(this.classList.replace("fas","far"),this.style.color="")});let es=document.querySelector(".lt-action-bar .fa-comment-dots"),em=document.getElementById("lt-input-overlay"),eg=document.getElementById("lt-chat-input"),eb=document.getElementById("lt-chat-send-btn"),ev=document.getElementById("lt-input-close-trigger");es&&es.addEventListener("click",()=>{em.style.display="flex",eg.focus()}),ev.addEventListener("click",()=>{em.style.display="none"}),eb.addEventListener("click",tD),eg.addEventListener("keydown",e=>{"Enter"===e.key&&(e.preventDefault(),tD())});let ew=document.getElementById("lt-play-pause-btn"),eI=document.getElementById("lt-vinyl-container"),e9=document.getElementById("lt-vinyl-view");ew.addEventListener("click",()=>{globalAudio.paused?(globalAudio.play(),ew.className="fas fa-pause-circle",eI.classList.add("playing"),e9.classList.add("playing")):(globalAudio.pause(),ew.className="fas fa-play-circle",eI.classList.remove("playing"),e9.classList.remove("playing"))});let e8=document.getElementById("lt-progress-slider");e8.addEventListener("mousedown",()=>isDraggingProgress=!0),e8.addEventListener("touchstart",()=>isDraggingProgress=!0),e8.addEventListener("input",()=>{let e=globalAudio.duration||0,t=e8.value/100*e;document.getElementById("lt-current-time").textContent=tP(t)});let eL=()=>{isDraggingProgress=!1;let e=globalAudio.duration||0;if(e>0){let t=e8.value/100*e;globalAudio.currentTime=t}};e8.addEventListener("change",eL),e8.addEventListener("touchend",eL);let eT=document.querySelector(".lt-controls .fa-list-ul"),eM=document.getElementById("lt-history-view");eT&&eM&&(eT.addEventListener("click",()=>{let e=eM.classList.toggle("active");e?(t_(),eT.style.color="var(--wechat-green-icon)"):eT.style.color=""}),eM.addEventListener("click",e=>{e.target===eM&&(eM.classList.remove("active"),eT.style.color="")}));let eN=[],eO=document.getElementById("cancel-call-btn"),e0=document.getElementById("end-call-btn"),eH=document.getElementById("in-call-send-btn"),eR=document.getElementById("in-call-input"),eq=document.getElementById("call-shared-screen"),eW=document.querySelector(".in-call-header");function ej(){let e=eR.value.trim(),t=eN.length>0;b?(eH.innerHTML='<i class="fas fa-spinner fa-spin"></i>',eH.disabled=!0,eH.style.backgroundColor="rgba(255,255,255,0.3)"):e.length>0?(eH.innerHTML='<i class="fas fa-paper-plane"></i>',eH.disabled=!1,eH.style.backgroundColor="rgba(255,255,255,0.3)"):t?(eH.innerHTML='<i class="fas fa-arrow-up"></i>',eH.disabled=!1,eH.style.backgroundColor="rgba(255,255,255,0.3)"):(eH.innerHTML='<i class="fas fa-paper-plane"></i>',eH.disabled=!0,eH.style.backgroundColor="rgba(255,255,255,0.3)")}async function e7(){if(0!==eN.length&&!b){b=!0,eX(),ej();try{let e=document.getElementById("chat-simulation-log"),t=Array.from(e.querySelectorAll(".chat-simulation-message")).slice(0,5).reverse().map(e=>{let t=e.classList.contains("me")?"{{user}}":q.name;return`${t}: ${e.textContent}`}).join("\n"),a=eN.map(e=>`{{user}}: ${e}`).join("\n");eN=[];let i=eq.querySelector(".screen-description")?.textContent||"画面中空无一物。",n=function e(t,a,i){let n=`
[情景: 视频通话中]

**你的身份**:
你正在扮演 **${ed(t,null)} (ID: ${t})**，与 **{{user}}** 进行视频通话。

**【你的三种表达方式】**

1.  **语言 (直接输出文本):**
    *   你 **说出口** 的每一句话，直接写出来即可，**每句话占一行**。

2.  **画面 (使用指令):**
    *   这里用来展示 **{{user}} 能看到的一切**：你的动作、表情、以及你周围的环境。
    *   使用 \`UPDATE_CALL_SCREEN:{"type":"description", "value":"画面描述"}\` 指令来更新这个画面。

3.  **挂断电话 (使用指令 - NEW):**
    *   当你（角色）因为任何原因（聊完了、生气了、有急事等）想要主动结束通话时，使用此指令。
    *   这是一个**终结性动作**，发出后不要再有任何其他内容。
    *   **格式**: \`END_CALL:{"ender":"${t}"}\`

**【当前画面】**
这是 {{user}} 目前通过你的视角看到的画面。你的下一个画面描述应该是**基于此画面的延续或合理变化**。
\`\`\`
${i}
\`\`\`

**【示例：如何结合画面与语言】**
*   **情景**: 你刚洗完澡，正在和 {{user}} 聊天。

    \`UPDATE_CALL_SCREEN:{"type":"description", "value":"他似乎刚洗完澡，金色的头发湿漉漉地贴在额前，身上只松垮地裹着一件酒店的白色浴袍。"}\`
    刚洗完澡，抱歉让你久等了。
    这边酒店的浴袍还挺舒服的。
    你那边怎么样？一切都还好吗？

**最近的对话:**
${a}

现在，请开始你的表演。
`;return n.trim()}(q.id,t+"\n"+a,i);N=n;let l=await v({user_input:n,should_stream:!1});M=l.trim();let r=l.trim().replace(/^```json\n?|```\n?$/g,"").trim().split("\n").map(e=>e.trim().replace(/^`|`$/g,""));for(let o of r){if(!o)continue;let s=/UPDATE_CALL_SCREEN:({.*})/,d=o.match(s);if(d)try{let c=JSON.parse(d[1]);eu(c)}catch(m){console.error("[Call Parser] Failed to parse UPDATE_CALL_SCREEN JSON:",m,d[1])}else if(o.startsWith("END_CALL:"))try{let p=o.substring(9),u=JSON.parse(p);if(u.ender){await showDialog({mode:"alert",text:`${ed(u.ender,null)} 挂断了通话。`}),ey();return}}catch(g){}else if(o.startsWith("(You say):"));else{let y=document.createElement("div");y.className="chat-simulation-message",y.textContent=o,e.insertBefore(y,e.firstChild)}let f=1e3*Math.random()+1500;await new Promise(e=>setTimeout(e,f))}}catch(h){console.error("[Call AI] AI response failed:",h);let w=document.getElementById("chat-simulation-log"),E=document.createElement("div");E.className="chat-simulation-message",E.textContent="(对方似乎信号不太好...)",w.insertBefore(E,w.firstChild)}finally{b=!1,eX(),ej()}}}function eF(){let e=eR.value.trim(),t=document.getElementById("chat-simulation-log");if(e){let a=document.createElement("div");a.className="chat-simulation-message me",a.textContent=e,t.insertBefore(a,t.firstChild),eN.push(e),eR.value="",eR.focus(),ej()}else e7()}eq.addEventListener("click",e=>{e.stopPropagation(),eq.style.opacity="0",eq.style.pointerEvents="none"}),eW.addEventListener("click",()=>{"0"===eq.style.opacity&&(eq.style.opacity="1",eq.style.pointerEvents="auto")}),eH.addEventListener("click",eF),eR.addEventListener("input",ej),eR.addEventListener("keydown",e=>{"Enter"!==e.key||e.shiftKey||(e.preventDefault(),eF())}),eO.addEventListener("click",()=>{eN=[],ey()}),e0.addEventListener("click",()=>{eN=[],ey()}),document.getElementById("call-screen-prev-btn").addEventListener("click",()=>{z>0&&(z--,V())}),document.getElementById("call-screen-next-btn").addEventListener("click",()=>{z<Y.length-1&&(z++,V())}),document.getElementById("accept-call-btn").addEventListener("click",ef),document.getElementById("decline-call-btn").addEventListener("click",eh),document.getElementById("forum-profile-view").addEventListener("click",async function(e){let t=document.getElementById("forum-profile-view"),a=t.querySelector(".profile-name"),i=a?a.textContent:null,n=eo(i),l=e.target.closest(".header .fa-arrow-left");if(l){if(n&&("user"===n.id||"{{user}}"===n.id))ep("weibo");else{let r=document.getElementById("weibo-detail-view"),o=r?r.dataset.postId:null;o?ep("weiboDetail",{postId:o}):ep("weibo")}return}let s=e.target.closest(".tab-item");if(s){if(s.classList.contains("active"))return;let d=s.dataset.tab,c=n&&("user"===n.id||"{{user}}"===n.id);if("posts"===d&&!c){let m=document.getElementById("profile-tab-posts");if(1===m.children.length&&m.querySelector("p")){e.preventDefault();let p=await showDialog({mode:"confirm",text:`TA的主页空空如也，是否要催更一下，让 ${i} 发布几篇新动态？`});p&&await as(n.id)}}let u=s.parentElement,g=u.nextElementSibling;u.querySelectorAll(".tab-item").forEach(e=>e.classList.remove("active")),g.querySelectorAll(".profile-tab-content > div").forEach(e=>e.classList.remove("active")),s.classList.add("active"),document.getElementById("profile-tab-"+d).classList.add("active");return}let y=e.target.closest("#profile-tab-posts .post-card");if(y){let f=y.dataset.postId;f&&(ep("weiboDetail",{postId:f}),eA(f));return}let h=e.target.closest(".post-link");if(h){let E=h.dataset.postId;E&&(ep("weiboDetail",{postId:E}),eA(E));return}let I=e.target.closest(".ama-input-box button");if(I){if(b){await showDialog({mode:"alert",text:"AI正在思考中，请稍后再问。"});return}if(!n)return;let x=t.querySelector(".ama-qna-list"),$=t.querySelector(".ama-input-box textarea"),L=$.value.trim();if(!L){await showDialog({mode:"alert",text:"问题内容不能为空。"});return}b=!0,I.innerHTML='<i class="fas fa-spinner fa-spin"></i>',I.disabled=!0;try{let k=function e(t,a){let i="user"===t||"{{user}}"===t?A:_.find(e=>e.id===t);if(!i)return console.error(`[AMA Context] 无法为 ${t} 创建上下文，角色不存在。`),null;let n=`
[任务: 匿名提问箱]

*   **核心身份**: 你现在是 **${ed(i.id,null)} (ID: ${i.id})**。

*   **当前情景**:
    这是一个私人的匿名提问箱，有人匿名向你提问，极度私密，除了你没人看到。

*   **提问箱**:
    "${a}"

*   **【最高准则：人设一致】**:
    你必须做出符合该角色人设的回答，禁止OOC，内容可长可短，视人设决定。直面这个问题，并给出你内心最原始、最未经修饰的真实想法。

*   **你的任务**:
    作为 **${ed(i.id,null)}** ，以他的口吻回答这个问题。

[技术要求：输出格式]
你的回复中 **只能包含** 下方的指令格式，严禁任何额外的解释、闲聊或Markdown标记。

AMA_ANSWER:{"answer":"这里是你的回答..."}

*   **【输出示例】**:
    AMA_ANSWER:{"answer":"你的回复内容"}

[你的指令]
现在，请沉浸到角色的内心深处，严格遵循以上格式，给出你的回答。
`;return n.trim()}(n.id,L);if(!k)throw Error("无法为AI生成有效的上下文。");N=k;let T=await v({user_input:k,should_stream:!1});M=T.trim();let S=M.match(/AMA_ANSWER:({.*})/);if(S){let B=JSON.parse(S[1]),D=B.answer,C={key:"AMA_PAIR",data:{author:n.id,question:L,answer:D,timestamp:new Date().toISOString()}};w.addEntry(C),await w.persistLogToStorage();let O=document.createElement("div");O.className="qna-card",O.innerHTML=`
					<div class="question"><p>${L.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p></div>
					<div class="answer">
						<div class="answer-content">
							<p class="author">${ed(n.id,null)}</p>
							<p>${D.replace(/\n/g,"<br>")}</p>
						</div>
					</div>
				`,x.prepend(O),$.value=""}else await showDialog({mode:"alert",text:"AI未能给出有效的内心独白，请稍后再试。"})}catch(P){console.error("[AMA AI Call] Failed:",P),await showDialog({mode:"alert",text:`AI响应失败: ${P.message}`})}finally{b=!1,I.innerHTML='<i class="fas fa-paper-plane"></i>',I.disabled=!1}return}let H=e.target.closest("#view-more-ama-btn");if(H){if(!n)return;let R=await showDialog({mode:"confirm",text:`是否要对 ${i} 进行一次“灵魂叩问”？
(这将消耗一次API调用)`});if(R){let q=document.getElementById("profile-tab-ama").querySelector(".ama-qna-list");b=!0,H.textContent="思考中...";try{let U=function e(t){let a="user"===t||"{{user}}"===t?A:_.find(e=>e.id===t);if(!a)return console.error(`[AMA Context] 无法为 ${t} 创建上下文，角色不存在。`),null;let i=`
[任务: 匿名问答环节导演]

*   **你的双重身份**:
    1.  **主角**: 你正在扮演 **${ed(a.id,null)} (ID: ${a.id})**。
    2.  **提问者**: 你同时还需要扮演一些匿名的、充满好奇心的路人。

*   **核心任务**:
    基于你所知道的关于 **${ed(a.id,null)}** 的一切（TA的性格、最近的经历、人际关系等），请自导自演 **2-3** 个能深度揭示其内心世界或近期动态的“匿名问答”。

*   **内容要求**:
    *   问题应该刁钻、有趣或直击内心，像是真正的粉丝或八卦者会问出的问题。
    *   回答必须完全符合 **${ed(a.id,null)}** 的人设、口吻和当前心境。

[技术要求：输出格式]
你的回复中 **只能包含** 下方的“逐行指令”格式，每一条指令独立成行，严禁任何额外的解释、闲聊或Markdown标记。

AMA_PAIR:{"question":"这里是匿名用户提出的问题内容","answer":"这里是角色以第一人称口吻做出的回答内容"}

*   **【输出示例】**:
    AMA_PAIR:{"question":"学长，你觉得爱情和事业哪个更重要？","answer":"都重要，但要在不同的人生阶段有所侧-重。现阶段于我而言，追求知识的深度更为迫切。"}
    AMA_PAIR:{"question":"最近在读什么书呀？可以推荐一下吗？","answer":"正在读卡尔维诺的《看不见的城市》，每一页都像是一场绮丽的梦境。"}

[你的指令]
现在，请开始你的表演，严格遵循以上格式，为 ${ed(a.id,null)} 生成几组精彩的匿名问答。
`;return i.trim()}(n.id);N=U;let G=await v({user_input:U,should_stream:!1});M=G.trim();let W=/^AMA_PAIR:(.*)$/gm,j,Y=[];for(;null!==(j=W.exec(G));)try{let z=JSON.parse(j[1]);z.question&&z.answer&&Y.push({key:"AMA_PAIR",data:{author:n.id,question:z.question,answer:z.answer,timestamp:new Date().toISOString()}})}catch(F){}Y.length>0?(Y.forEach(e=>w.addEntry(e)),await w.persistLogToStorage(),await eC(n.id)):q.innerHTML='<p style="text-align:center; color: var(--forum-text-secondary); padding: 1rem;">AI未能生成有效的问答内容，请稍后再试。</p>'}catch(V){console.error("[AMA AI Call] Failed:",V),await showDialog({mode:"alert",text:`AI响应失败: ${V.message}`})}finally{b=!1;let X=document.getElementById("view-more-ama-btn");X&&(X.textContent="\uD83D\uDD0D 查看更多")}}}}),document.getElementById("forum-nav-profile").addEventListener("click",()=>{ep("forumProfile",{contactId:"user"})}),ex(c,e=>{let t=e.target.closest(".message-row");t&&!document.getElementById("wechat-chat-view").classList.contains("delete-mode")&&function e(t,a){let i=document.querySelector(".context-menu");i&&i.remove();let n=document.querySelector(".context-menu-backdrop");n&&n.remove();let l=t.querySelector(".message-bubble"),r=t.querySelector(".message-avatar");if(!l||!r)return;let o=r.dataset.senderId,s="";if(l.classList.contains("sticker-bubble"))s=`[表情]`;else if(l.classList.contains("image-url-bubble"))s="[图片]";else if(l.classList.contains("voice-bubble"))s="[语音]";else{let d=l.querySelector(".reply-text");s=d?d.textContent.trim():l.textContent.trim()}if(!o||!s)return;let c=ed(o,T),p=document.createElement("div");p.className="context-menu",p.innerHTML=`<div class="context-menu-item" data-action="quote">引用</div>`;let u=document.createElement("div");u.className="context-menu-backdrop",document.body.appendChild(u),document.body.appendChild(p);let g=a.type.includes("touch")?a.touches[0].clientX:a.clientX,y=a.type.includes("touch")?a.touches[0].clientY:a.clientY;p.style.left=`${g}px`,p.style.top=`${y}px`;let f=()=>{p.remove(),u.remove()};u.addEventListener("click",f),p.addEventListener("click",e=>{if("quote"===e.target.dataset.action){let t=`[引用: "${c}: ${s}"] `;m.value=t,m.focus(),m.setSelectionRange(m.value.length,m.value.length)}f()})}(t,e)},{duration:500}),document.getElementById("app-font-studio").addEventListener("click",()=>{ep("fontStudio")}),document.getElementById("font-studio-back-btn").addEventListener("click",()=>{ep("home")}),document.getElementById("font-studio-save-btn").addEventListener("click",()=>{t8()}),document.getElementById("font-studio-reset-btn").addEventListener("click",()=>{tL()}),document.getElementById("font-url-apply-btn").addEventListener("click",async()=>{let e=document.getElementById("font-url-input"),t=e.value.trim();if(!t){await showDialog({mode:"alert",text:"请输入字体链接！"});return}let a=`CustomFont_${Date.now()}`,i=`
@font-face {
font-family: '${a}';
src: url('${t}') format('truetype');
font-weight: normal;
font-style: normal;
}
body {
font-family: '${a}', sans-serif;
}
`;document.getElementById("font-css-input").value=i.trim(),t8()}),document.getElementById("export-theme-btn").addEventListener("click",e=>{e.preventDefault(),tx()}),document.getElementById("import-theme-btn").addEventListener("click",e=>{e.preventDefault(),function e(){let t=document.createElement("input");t.type="file",t.accept=".json,application/json",t.onchange=e=>{let t=e.target.files[0];if(!t)return;let a=new FileReader;a.onload=async e=>{try{let t=e.target.result,a=JSON.parse(t);if(!a.meta||!a.globalTheme||!a.bubbleTheme)throw Error("无效的主题文件格式。");let i=await showDialog({mode:"confirm",text:`确定要导入主题 "${a.meta.name||"未知主题"}" 吗？

这将覆盖您当前所有的设计，包括全局壁纸！`});if(i){let n=`blmx_global_theme_${k}`,l=`blmx_bubble_theme_${k}`;localStorage.setItem(n,JSON.stringify(a.globalTheme)),localStorage.setItem(l,JSON.stringify(a.bubbleTheme)),await showDialog({mode:"alert",text:"主题导入成功！应用即将刷新以应用所有新设置。"}),location.reload()}}catch(r){console.error("[Theme Manager] Failed to import theme:",r),await showDialog({mode:"alert",text:`导入失败：${r.message}`})}},a.readAsText(t)},t.click()}()});let eV=document.getElementById("bubble-workshop-view");eV.addEventListener("click",async e=>{let t=e.target,a=eV,i=t.closest(".collapsible-header");if(i&&!a.classList.contains("is-locked")){let n=i.closest(".studio-control-group.collapsible");n&&n.classList.toggle("active");return}if("bubble-workshop-load-btn"===t.id){tI(),a.classList.contains("is-locked")&&(a.classList.remove("is-locked"),await showDialog({mode:"alert",text:"编辑已激活！您可以开始自定义气泡了。"}));return}if(a.classList.contains("is-locked")){e.stopPropagation(),e.preventDefault(),await showDialog({mode:"alert",text:"请先点击“载入当前”以激活编辑功能。"});return}if("sync-me-to-them-btn"===t.id){let l=await showDialog({mode:"confirm",text:"确定要用【我的气泡】样式覆盖【对方气泡】吗？此操作不可撤销。"});if(l){let r=tw("me");tE(r,"them"),"them"===document.querySelector('input[name="bubble-target"]:checked').value&&tI(),await showDialog({mode:"alert",text:"同步成功！"})}return}if("sync-them-to-me-btn"===t.id){let o=await showDialog({mode:"confirm",text:"确定要用【对方气泡】样式覆盖【我的气泡】吗？此操作不可撤销。"});if(o){let s=tw("them");tE(s,"me"),"me"===document.querySelector('input[name="bubble-target"]:checked').value&&tI(),await showDialog({mode:"alert",text:"同步成功！"})}return}if("bubble-workshop-save-btn"===t.id){(function e(){let t=["bg-mode","bg-url","backdrop-blur","wiggle-scale","background","bg-image","bg-image-size","bg-image-repeat","border-top-left-radius","border-top-right-radius","border-bottom-right-radius","border-bottom-left-radius","text-color","font-size","font-weight","font-family","border-width","border-style","border-color","box-shadow","padding-top","padding-right","padding-bottom","padding-left","margin-top","margin-right","margin-bottom","margin-left","deco-1-url","deco-1-content","deco-1-rotate","deco-1-font-size","deco-1-color","deco-1-width","deco-1-height","deco-1-top","deco-1-right","deco-1-bottom","deco-1-left","deco-1-z-index","deco-2-url","deco-2-content","deco-2-rotate","deco-2-font-size","deco-2-color","deco-2-width","deco-2-height","deco-2-top","deco-2-right","deco-2-bottom","deco-2-left","deco-2-z-index"],a={};["me","them"].forEach(e=>{a[e]={},t.forEach(t=>{let i=`--bubble-${e}-${t}`,n=getComputedStyle(document.documentElement).getPropertyValue(i).trim();""!==n&&(a[e][i]=n)})});let i=`blmx_bubble_theme_${k}`;try{return localStorage.setItem(i,JSON.stringify(a)),console.log(`[Bubble Workshop] Styles saved successfully to key: ${i}`,a),!0}catch(n){return console.error("[Bubble Workshop] Failed to save styles to localStorage:",n),!1}})()?await showDialog({mode:"alert",text:"气泡样式已成功保存！"}):await showDialog({mode:"alert",text:"保存失败，详情请查看控制台。"});return}if("bubble-workshop-reset-btn"===t.id){let d=await showDialog({mode:"confirm",text:"确定要恢复到默认样式吗？\n您当前保存的自定义主题将被清除。"});if(d){let c=`blmx_bubble_theme_${k}`;localStorage.removeItem(c),await showDialog({mode:"alert",text:"已恢复默认设置。应用即将刷新以应用更改..."}),location.reload()}return}});let e4=eV.querySelectorAll('input[name="bubble-target"]');e4.forEach(e=>{e.addEventListener("change",()=>{tI()})});let e6=document.getElementById("bubble-controls-container");e6&&(e6.addEventListener("input",e=>{"bubble-target"===e.target.name||eV.classList.contains("is-locked")||tv(e)}),e6.addEventListener("change",e=>{"bubble-target"===e.target.name||eV.classList.contains("is-locked")||tv(e)})),document.getElementById("app-bubble-workshop").addEventListener("click",()=>{ep("bubbleWorkshop"),function e(){let t=document.getElementById("bubble-preview-area");if(!t)return;t.innerHTML="",t.style.background="",t.style.padding="1rem",t.style.borderRadius="0.5rem";let a=document.createElement("div");a.style.cssText=`
display: flex;
flex-direction: column;
gap: 1rem;
`;let i=document.createElement("div");i.className="message-row them",i.innerHTML=`
<img src="https://files.catbox.moe/bialj8.jpeg" class="message-avatar">
<div class="message-content-wrapper">
	<div class="message-bubble" id="preview-bubble-them">这是角色的消息预览</div>
</div>
`;let n=document.createElement("div");n.className="message-row me",n.innerHTML=`
<div class="message-content-wrapper">
	<div class="message-bubble" id="preview-bubble-me">这是用户的消息预览</div>
</div>
<img src="${ec("user")}" class="message-avatar">
`,a.appendChild(i),a.appendChild(n),t.appendChild(a);let l=document.getElementById("bubble-workshop-view"),r=document.createElement("style");r.textContent=`
#bubble-workshop-view #bubble-preview-area {
background-color: var(--view-bg-primary);
}
`,l.querySelector("style")||l.prepend(r)}(),function e(){let t=document.getElementById("bubble-controls-container");if(!t)return;t.innerHTML="";let a=document.createElement("div");a.className="studio-control-group",a.innerHTML=`
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
	`,t.appendChild(a);let i=(e,t,a=!1)=>{let i=document.createElement("div");return i.className=`studio-control-group collapsible ${a?"active":""}`,i.innerHTML=`
				<div class="collapsible-header">
					<h4>${e}</h4>
					<i class="fas fa-chevron-down chevron-icon"></i>
				</div>
				<div class="collapsible-content">
					${t}
				</div>
			`,i},n=`
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
	`;t.appendChild(i("背景 (Background)",n));let l=`
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
	`;t.appendChild(i("形状 (Shape)",l));let r=`
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
	`;t.appendChild(i("字体 (Typography)",r));let o=`
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
	`;t.appendChild(i("边框 (Border)",o));let s=`
<div class="studio-control-row">
	<label class="label">铅笔扭曲度</label>
	<div class="control-wrapper">
		<input type="range" data-variable="wiggle-scale" min="0" max="15" step="0.5" value="0" style="width: 6rem;">
		<span class="range-value" style="width: 3.5rem; text-align: right;">0</span>
	</div>
</div>
<div class="studio-control-row">
	<p style="font-size:0.75em; color:var(--text-color-tertiary); margin:0;">提示：配合“形状”里的不同圆角值可实现不规则形状</p>
</div>
`;t.appendChild(i("手绘风格 (Sketch)",s));let d=`
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
`;t.appendChild(i("阴影 (Shadow)",d));let c=`
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
	`;t.appendChild(i("间距 (Spacing)",c));let m="";["1","2"].forEach(e=>{m+=`
<h5 style="margin-top:1.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--divider-color-secondary); padding-bottom: 0.5rem; color: var(--text-color-primary);">装饰层 ${e}</h5>

<!-- 类型选择 -->
<div class="studio-control-row">
	<label class="label">类型</label>
	<div class="control-wrapper deco-type-selector" data-layer="${e}">
		<label><input type="radio" name="deco-${e}-type" value="image" checked> 图片</label>
		<label style="margin-left:0.5rem;"><input type="radio" name="deco-${e}-type" value="text"> 字符/形状</label>
	</div>
</div>

<!-- 图片模式控件 (包含 URL、宽度、高度) -->
<div id="deco-${e}-image-group" class="deco-group-image">
	<div class="studio-control-row">
		<label class="label">图片 URL</label>
		<input type="text" data-variable="deco-${e}-url" placeholder="粘贴链接..." style="flex-grow:1;">
	</div>
	<div class="studio-control-row">
		<label class="label">宽度</label>
		<div class="control-wrapper">
			<input type="range" data-variable="deco-${e}-width" min="0" max="200" step="1" data-unit="px" style="width: 6rem;">
			<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
		</div>
	</div>
	<div class="studio-control-row">
		<label class="label">高度</label>
		<div class="control-wrapper">
			<input type="range" data-variable="deco-${e}-height" min="0" max="200" step="1" data-unit="px" style="width: 6rem;">
			<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
		</div>
	</div>
</div>

<!-- 字符模式控件 -->
<div id="deco-${e}-text-group" class="deco-group-text" style="display:none;">
	<div class="studio-control-row">
		<label class="label">内容 (Content)</label>
		<input type="text" data-variable="deco-${e}-content" placeholder="填入 ▲ 或 文字" style="width: 8rem; text-align:center;">
	</div>
	<div class="studio-control-row">
		<label class="label">字体大小</label>
		<div class="control-wrapper">
			<input type="range" data-variable="deco-${e}-font-size" min="10" max="100" step="1" data-unit="px" style="width: 6rem;">
			<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
		</div>
	</div>
	<div class="studio-control-row">
		<label class="label">颜色</label>
		<div class="control-wrapper">
			<input type="text" class="hex-input" data-variable="deco-${e}-color">
			<div class="color-input-wrapper">
				<input type="color" data-variable="deco-${e}-color">
				<div class="color-preview"></div>
			</div>
		</div>
	</div>
</div>

<!-- 通用位置与变换 -->
<div class="studio-control-row">
	<label class="label">旋转角度</label>
	<div class="control-wrapper">
		<input type="range" data-variable="deco-${e}-rotate" min="0" max="360" step="1" data-unit="deg" style="width: 6rem;">
		<span class="range-value" style="width: 3.5rem; text-align: right;"></span>
	</div>
</div>

<!-- 快速位置微调 -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1rem; font-size: 0.9em; margin-top: 0.5rem; background: rgba(0,0,0,0.03); padding: 0.5rem; border-radius: 4px;">
	<div style="display: flex; align-items: center; justify-content: space-between;"><label>Top:</label><input type="text" data-variable="deco-${e}-top" style="width: 4rem;" placeholder="auto"></div>
	<div style="display: flex; align-items: center; justify-content: space-between;"><label>Right:</label><input type="text" data-variable="deco-${e}-right" style="width: 4rem;" placeholder="auto"></div>
	<div style="display: flex; align-items: center; justify-content: space-between;"><label>Bottom:</label><input type="text" data-variable="deco-${e}-bottom" style="width: 4rem;" placeholder="auto"></div>
	<div style="display: flex; align-items: center; justify-content: space-between;"><label>Left:</label><input type="text" data-variable="deco-${e}-left" style="width: 4rem;" placeholder="auto"></div>
</div>
`}),t.appendChild(i("装饰 (Decorations)",m,!1))}(),document.getElementById("bubble-workshop-view").classList.add("is-locked")}),document.getElementById("bubble-workshop-back-btn").addEventListener("click",()=>{ep("home")}),document.getElementById("app-global-studio").addEventListener("click",()=>{ep("globalDesignStudio"),function e(){let t=document.getElementById("studio-body");if(!t)return;let a=t.querySelector("#color-controls-wrapper");a?a.innerHTML="":((a=document.createElement("div")).id="color-controls-wrapper",t.appendChild(a));let i=getComputedStyle(document.documentElement),n={};for(let l in globalThemeVariableMap){let r=globalThemeVariableMap[l];n[r.group]||(n[r.group]=[]),n[r.group].push({name:l,...r})}globalThemeGroupOrder.forEach(e=>{if(n[e]){let t=document.createElement("div");t.className="studio-color-group";let l=document.createElement("h4");l.textContent=e,t.appendChild(l),n[e].forEach(e=>{let a=i.getPropertyValue(e.name).trim(),n=document.createElement("div");if(n.className="studio-color-item","range"===e.type){let l=parseFloat(a)||e.min;n.innerHTML=`
<span class="label">${e.label}</span>
<div class="studio-color-controls">
    <input type="range" 
           data-variable="${e.name}" 
           min="${e.min}" 
           max="${e.max}" 
           step="${e.step||1}" 
           value="${l}" 
           style="width: 8rem; cursor: pointer; vertical-align: middle;">
    <span class="range-value" style="font-size: 0.85em; width: 3.5rem; text-align: right; color: var(--text-color-secondary); font-family: monospace;">
        ${l}${e.unit}
    </span>
</div>
`}else if("imageUrl"===e.type){let r=a.match(/url\(['"]?([^'"]+)['"]?\)/),o=r?r[1]:"";n.innerHTML=`
<span class="label">${e.label}</span>
<div class="studio-color-controls">
	<input type="text" class="hex-input" value="${o}" data-variable="${e.name}" data-type="imageUrl" placeholder="粘贴图片链接..." style="width: 12rem; text-align: left; font-family: sans-serif; flex-grow: 1;">
</div>
`}else{let s;s=a.startsWith("#")?7===a.length?a+"ff":a:rgbaToHex8(a);let d="#"+s.substring(1,7);n.innerHTML=`
<span class="label">${e.label}</span>
<div class="studio-color-controls">
	<input type="text" class="hex-input" value="${s}" data-variable="${e.name}" maxlength="9">
	<div class="color-input-wrapper">
		<input type="color" data-variable-picker-for="${e.name}" value="${d}">
		<div class="color-preview" style="background: ${a};"></div>
	</div>
</div>
`}t.appendChild(n)}),a.appendChild(t)}})}()}),document.getElementById("studio-back-btn").addEventListener("click",()=>{ep("home")}),document.getElementById("studio-body").addEventListener("input",e=>{let t=e.target,a=t.dataset.variable,i=t.dataset.variablePickerFor;if(a){if("range"===t.type){let n=globalThemeVariableMap[a],l=n&&n.unit?n.unit:"",r=t.value+l;document.documentElement.style.setProperty(a,r),t.nextElementSibling&&t.nextElementSibling.classList.contains("range-value")&&(t.nextElementSibling.textContent=r)}else if("imageUrl"===t.dataset.type){let o=t.value.trim()?`url('${t.value.trim()}')`:"none";document.documentElement.style.setProperty(a,o)}else{let s=t.value.trim(),d=hexToRgba(s);if(d){let c=`rgba(${d.r}, ${d.g}, ${d.b}, ${d.a})`;document.documentElement.style.setProperty(a,c);let m=t.closest(".studio-color-controls");if(m){let p=m.querySelector(`[data-variable-picker-for="${a}"]`),u=m.querySelector(".color-preview");p&&(p.value="#"+(s.substring(1,7)||"000000")),u&&(u.style.backgroundColor=c)}}}}else if(i){let g=document.querySelector(`.hex-input[data-variable="${i}"]`);if(g){let y=t.value,f=g.value.substring(7,9)||"ff";g.value=y+f,g.dispatchEvent(new Event("input",{bubbles:!0}))}}}),document.getElementById("studio-save-btn").addEventListener("click",async()=>{let e={},t=document.querySelectorAll("#studio-body input[data-variable]");t.forEach(t=>{let a=t.dataset.variable,i=t.value.trim(),n=globalThemeVariableMap[a];n&&"range"===n.type&&n.unit&&!i.endsWith(n.unit)&&(i+=n.unit),e[a]=i}),localStorage.setItem(`blmx_global_theme_${k}`,JSON.stringify(e)),ax(),await showDialog({mode:"alert",text:"全局主题已成功保存！"})}),document.getElementById("studio-reset-btn").addEventListener("click",async()=>{let e=await showDialog({mode:"confirm",text:"确定要恢复到默认主题吗？\n您当前保存的自定义主题将被清除。"});e&&(localStorage.removeItem(`blmx_global_theme_${k}`),location.reload())});let e5={"nav-wechat":"wechatList","nav-wechat-from-contacts":"wechatList","nav-wechat-from-me":"wechatList","nav-contacts":"contacts","nav-contacts-from-contacts":"contacts","nav-contacts-from-me":"contacts","nav-me":"me","nav-me-from-contacts":"me","nav-me-from-me":"me"};async function eJ(e){if(!e)return;let t=O.posts.find(t=>t.postId===e);t&&(w.logEntries=w.logEntries.filter(t=>("WEIBO_POST"!==t.key||t.data.postId!==e)&&("WEIBO_COMMENT"!==t.key&&"WEIBO_LIKE"!==t.key||t.data.postId!==e&&t.data.target_post_id!==e)),e3(),await w.persistLogToStorage(),eD(t.category),await showDialog({mode:"alert",text:"帖子已删除。"}))}function eZ(e){let t=!1;return w.logEntries.forEach(a=>{"WEIBO_COMMENT"===a.key&&a.data.target_post_id===e&&!1===a.data.isRead&&(a.data.isRead=!0,t=!0)}),t&&e3(),t}document.querySelector(".phone-screen").addEventListener("click",e=>{let t=e.target.closest(".nav-item");t&&e5[t.id]&&(ep(e5[t.id]),"contacts"===e5[t.id]&&td())}),document.getElementById("block-contact-btn").addEventListener("click",e=>{let t=document.getElementById("contact-details-profile-card").dataset.contactId;t&&th(t)}),document.getElementById("contacts-list-container").addEventListener("click",e=>{let t=e.target.closest(".conversation-item");if(t){let a=t.dataset.contactId;if(!a)return;let i=C.find(e=>"single"===e.type&&e.members.includes(a));if(!i){let n={id:`convo_single_${a}`,type:"single",members:["user",a],unread:0,pinned:!1,lastActivity:Date.now()};C.push(n),el(),i=n}ep("wechatChat",{conversationId:i.id})}}),document.getElementById("app-wechat").addEventListener("click",()=>ep("wechatList")),document.getElementById("app-settings").addEventListener("click",()=>ep("settings")),document.getElementById("app-weibo").addEventListener("click",()=>ep("weibo")),document.getElementById("weibo-back-btn").addEventListener("click",()=>ep("home")),document.getElementById("weibo-feed-back-btn").addEventListener("click",()=>ep("weibo")),document.getElementById("weibo-settings-btn").addEventListener("click",async()=>{let e=tT()||{name:"",avatar:""},t=await af({title:"论坛设置",fields:[{id:"name",label:"马甲昵称",defaultValue:e.name},{id:"avatar",label:"马甲头像 URL",defaultValue:e.avatar},{id:"darkMode",label:"夜间模式 (仅论坛)",type:"switch",defaultValue:document.getElementById("weibo-view").classList.contains("forum-dark-mode")||document.getElementById("forum-profile-view").classList.contains("forum-dark-mode")},{id:"fontSize",label:"详情页字体",type:"slider",min:.7,max:1.2,step:.05,unit:"em",defaultValue:parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--forum-font-size"))||.9}]});if(null!==t){""===t.name.trim()&&""===t.avatar.trim()?localStorage.removeItem(`blmx_weibo_anonymous_identity_${k}`):function e(t){let a=`blmx_weibo_anonymous_identity_${k}`;try{let i=JSON.stringify(t);localStorage.setItem(a,i)}catch(n){console.error("保存“马甲”身份信息失败:",n)}}({name:t.name,avatar:t.avatar});let a=t.darkMode,i=[document.getElementById("weibo-view"),document.getElementById("weibo-feed-view"),document.getElementById("weibo-detail-view"),document.getElementById("forum-profile-view")];i.forEach(e=>{e&&e.classList.toggle("forum-dark-mode",a)}),localStorage.setItem(`blmx_forum_theme_${k}`,a?"dark":"light");let n=t.fontSize;document.documentElement.style.setProperty("--forum-font-size",`${n}em`),localStorage.setItem(`blmx_forum_font_size_${k}`,n),await showDialog({mode:"alert",text:"设置已保存！"})}}),document.getElementById("weibo-detail-back-btn").addEventListener("click",()=>{let e=document.getElementById("weibo-detail-view"),t=e.dataset.currentPostId;if(t){let a=eZ(t);a&&w.persistLogToStorage()}let i=O.posts.find(e=>e.postId===t);if(i&&i.category){let n=document.querySelector(`.weibo-zone-card[data-category="${i.category}"]`),l=n?n.querySelector(".zone-title").textContent:"帖子列表";ep("weiboFeed",{category:i.category,categoryName:l}),eD(i.category)}else ep("weibo")}),document.getElementById("app-diary").addEventListener("click",()=>ep("diary")),document.getElementById("diary-back-btn").addEventListener("click",()=>ep("home")),document.getElementById("diary-select-owner-btn").addEventListener("click",async e=>{e.stopPropagation();let t=await new Promise(e=>{let t=document.getElementById("diary-owner-modal"),a=t.querySelector(".diary-owner-list-container"),i=t.querySelector(".close-btn"),n=a.cloneNode(!1);a.parentNode.replaceChild(n,a);let l=a=>{t.style.display="none",e(a)};_.forEach(e=>{let t=document.createElement("div");t.className="diary-owner-list-item",t.innerHTML=`
                <img src="${ec(e.id)}" alt="${ed(e.id,null)}">
                <span>${ed(e.id,null)}</span>
            `,t.addEventListener("click",()=>{l(e.id)}),n.appendChild(t)}),i.onclick=()=>l(null),t.style.display="flex"});if(t){let a=document.getElementById("diary-owner-name");document.querySelector(".diary-cover").dataset.ownerId=t,a.textContent=ed(t,null),a.classList.remove("sticker-placeholder"),await showDialog({mode:"alert",text:`已选择查看 ${a.textContent} 的日记。`})}}),document.querySelector(".diary-cover").addEventListener("click",()=>{let e=document.querySelector(".diary-cover").dataset.ownerId;if(!e){showDialog({mode:"alert",text:"请先通过“选择”按钮指定一位日记主人！"});return}ep("diaryEntry",{ownerId:e})}),document.getElementById("diary-entry-back-btn").addEventListener("click",()=>{ep("diary")}),document.getElementById("diary-create-entry-btn").addEventListener("click",async()=>{if(b){await showDialog({mode:"alert",text:"AI正在生成中，请稍后再试。"});return}let e=document.getElementById("diary-entry-view").dataset.ownerId;if(!e){await showDialog({mode:"alert",text:"错误：找不到日记主人信息。"});return}let t=ed(e,null),a=await showDialog({mode:"confirm",text:`是否要探寻一下 ${t} 此刻的心事，并让Ta记录下来？`});a&&(await showDialog({mode:"alert",text:`正在探寻 ${t} 的心事，请稍候...`}),await ez(e))}),document.getElementById("diary-change-bg-btn").addEventListener("click",async()=>{let e=document.getElementById("diary-entry-view").dataset.ownerId;if(!e){await showDialog({mode:"alert",text:"错误：找不到日记主人信息。"});return}let t=_.find(t=>t.id===e);if(!t){console.error("Error: Cannot find contact object for ownerId:",e);return}let a=await showDialog({mode:"prompt",text:`为 ${ed(t.id,null)} 的日记设置背景图URL：
（留空则恢复默认）`,defaultValue:t.diaryWallpaper||""});null!==a&&(t.diaryWallpaper=a.trim()||void 0,el(),eP(e),await showDialog({mode:"alert",text:"背景已更新！"}))}),document.getElementById("diary-delete-entry-btn").addEventListener("click",async e=>{if(e.currentTarget.classList.contains("disabled"))return;let t=document.getElementById("diary-entry-view"),a=parseInt(t.dataset.viewingIndex,10),i=t.dataset.ownerId;if(isNaN(a)||a<0){await showDialog({mode:"alert",text:"当前没有可删除的日记。"});return}let n=await showDialog({mode:"confirm",text:"确定要永久删除这篇日记吗？此操作不可撤销。"});n&&(w.logEntries.splice(a,1),await w.persistLogToStorage(),await showDialog({mode:"alert",text:"日记已删除。"}),ep("diaryEntry",{ownerId:i}))}),document.getElementById("diary-prev-btn").addEventListener("click",e=>{if(e.currentTarget.classList.contains("disabled"))return;let t=document.getElementById("diary-entry-view"),a=t.dataset.ownerId,i=parseInt(t.dataset.viewingIndex,10),n=w.logEntries.map((e,t)=>({...e,originalIndex:t})).filter(e=>"DIARY_ENTRY"===e.key&&e.data.author===a).sort((e,t)=>new Date(t.data.timestamp)-new Date(e.data.timestamp)),l=n.findIndex(e=>e.originalIndex===i);if(l>0){let r=n[l-1];eE(r.originalIndex)}}),document.getElementById("diary-next-btn").addEventListener("click",e=>{if(e.currentTarget.classList.contains("disabled"))return;let t=document.getElementById("diary-entry-view"),a=t.dataset.ownerId,i=parseInt(t.dataset.viewingIndex,10),n=w.logEntries.map((e,t)=>({...e,originalIndex:t})).filter(e=>"DIARY_ENTRY"===e.key&&e.data.author===a).sort((e,t)=>new Date(t.data.timestamp)-new Date(e.data.timestamp)),l=n.findIndex(e=>e.originalIndex===i);if(l<n.length-1){let r=n[l+1];eE(r.originalIndex)}}),ex(document.querySelector(".diary-entry-body"),()=>{let e=document.getElementById("diary-entry-view"),t=e.classList.toggle("icons-hidden");localStorage.setItem("blmx_diary_icons_hidden",t)},{duration:800}),document.getElementById("soft-reset-btn").addEventListener("click",e=>{e.preventDefault(),tu()}),document.getElementById("hard-reset-btn").addEventListener("click",e=>{e.preventDefault(),tg()}),document.getElementById("summarize-and-clear-btn").addEventListener("click",async e=>{e.preventDefault();let t=await showDialog({mode:"confirm",text:"确定要让AI总结并存档所有历史记录吗？\n\n此操作将永久清除所有详细聊天、朋友圈和微博记录，仅保留一段AI生成的摘要。此操作不可撤销！"});t&&await eG()}),document.getElementById("weibo-view").addEventListener("click",async e=>{let t=e.target.closest("#forum-nav-snapshot");if(t){e2();return}let a=e.target.closest(".weibo-zone-card");if(!a||!a.dataset.category)return;let i=await showDialog({mode:"confirm",text:`是否要查看【${a.querySelector(".zone-title").textContent}】分区？`});if(!i)return;let n=a.dataset.category,l=a.querySelector(".zone-title").textContent,r=O.posts.filter(e=>e.category===n);r.length>0?(eD(n),ep("weiboFeed",{category:n,categoryName:l})):(await ad(n),eD(n),ep("weiboFeed",{category:n,categoryName:l}))}),document.getElementById("forum-nav-add").addEventListener("click",()=>{aE()}),document.getElementById("weibo-feed-view").addEventListener("click",async e=>{if("weibo-create-post-btn"===e.target.id){eY();return}let t=e.target.closest(".thread-delete-btn");if(t){e.stopPropagation();let a=t.closest(".forum-thread-item-card"),i=a.dataset.postId,n=await showDialog({mode:"confirm",text:"确定要删除这条帖子吗？此操作不可恢复。"});n&&await eJ(i);return}let l=e.target.closest(".forum-thread-item-card");if(l){let r=l.dataset.postId,o=O.posts.find(e=>e.postId===r);if(!o)return;o.isRead=!0;let s=w.logEntries.find(e=>"WEIBO_POST"===e.key&&e.data.postId===r);s&&(s.data.isRead=!0);let d=l.querySelector(".thread-read-star");if(d&&(d.classList.add("read"),d.title="已读"),o.text||o.content){ep("weiboDetail",{postId:r,category:o.category}),eA(r);let c=O.comments[r]&&O.comments[r].length>0;c||await am(r)}else await ac(r),ep("weiboDetail",{postId:r,category:o.category}),eA(r)}}),document.getElementById("weibo-anon-toggle-btn").addEventListener("click",async e=>{let t=tT();if(!t||!t.name){await showDialog({mode:"alert",text:"请先在论坛主页通过齿轮设置您的马甲，才能使用匿名模式。"}),e.target.classList.remove("active"),ee=!1;return}ee=!ee,e.target.classList.toggle("active",ee),ee?await showDialog({mode:"alert",text:`匿名模式已开启，将以【${t.name}】的身份发言。`}):await showDialog({mode:"alert",text:"匿名模式已关闭。"})}),document.getElementById("weibo-detail-view").addEventListener("click",async e=>{let t=e.target,a=document.getElementById("weibo-detail-view"),i=a.dataset.postId,n=t.closest(".forum-user-panel");if(n){let l=n.closest(".forum-post-card");if(l){let r=l.dataset.authorName,o=eo(r);o&&"user"!==o.id&&"{{user}}"!==o.id&&ep("forumProfile",{contactId:o.id})}return}if(t.closest(".share-icon")){!function e(t){let a=t.currentTarget.dataset.postId,i=O.posts.find(e=>e.postId===a);if(!i){console.error("转发失败，找不到帖子:",a);return}let n=i.title||(i.text.match(/^【([^】]+)】/)?i.text.match(/^【([^】]+)】/)[1]:`来自${i.author}的微博`),l=i.text.replace(/^【[^】]+】/,"").trim(),r={type:"weibo_post",postId:i.postId,title:n,author:i.author,summary:l.substring(0,50)+"..."};ak([JSON.stringify(r)],"forward")}({currentTarget:a});return}let s=t.closest(".weibo-comment-actions");if(s){let d=s.dataset.action,c=s.dataset.commentId;if("reply"===d){let m=s.dataset.authorName,p=a.querySelector(".weibo-comment-input"),u=s.closest(".forum-post-card"),g=u?u.querySelector(".forum-post-body"):null,y="";if(g){let f=g.cloneNode(!0),h=f.querySelectorAll(".forum-quote-block");h.forEach(e=>e.remove()),y=(y=f.textContent.trim()).replace(/\[引用:"(?:.|\n)*?"\]\s*/g,"")}y||(y="...");let b=y.substring(0,50);p.value=`[引用:"${m}: ${b}"] `,p.focus(),p.setSelectionRange(p.value.length,p.value.length)}else if("delete"===d){let v=await showDialog({mode:"confirm",text:"确定要删除这条评论吗？"});if(v){let E=w.logEntries.findIndex(e=>"WEIBO_COMMENT"===e.key&&e.data.commentId===c);if(E>-1){w.logEntries.splice(E,1),e3(),await w.persistLogToStorage();let I=a.querySelector(`[data-comment-id="${c}"]`);I&&I.remove();let x=I?I.closest(".forum-post-card"):null;x&&x.remove(),await showDialog({mode:"alert",text:"评论已删除。"})}}}return}let $=t.closest(".weibo-send-comment-btn");if($)try{let L=a.querySelector(".weibo-comment-input"),k=L.value.trim();if(!k)return;let T=eZ(i);if(T){await w.persistLogToStorage();let S=a.querySelectorAll(".unread-indicator");S.forEach(e=>e.remove())}let B=A.id;if(ee){let D=tT();if(D&&D.name)B=D.name;else{await showDialog({mode:"alert",text:"错误：匿名模式已开启，但未找到马甲信息。"});return}}let _=new Date(window.currentGameDate),C=`${_.getFullYear()}-${String(_.getMonth()+1).padStart(2,"0")}-${String(_.getDate()).padStart(2,"0")}T${String(_.getHours()).padStart(2,"0")}:${String(_.getMinutes()).padStart(2,"0")}`,M=k.match(/\[引用:"(.*?):\s*([\s\S]*?)"\]([\s\S]*)/),N;if(M){let P=M[1].trim(),H=M[2].trim(),R=M[3].trim(),q=(O.comments[i]||[]).find(e=>{if(ed(e.author,null)!==P)return!1;let t=(e.text||"").trim(),a=H;if(!a)return!0;if(!a.endsWith("..."))return t===a||t.includes(a);{let i=a.slice(0,-3).trim();return i.length<2?t.includes(i):t.startsWith(i)}}),U;U=q?{target_post_id:i,author:"user"===B?"{{user}}":B,text:R,replyTo:q.commentId,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,timestamp:C,isRead:!1}:{target_post_id:i,author:"user"===B?"{{user}}":B,text:k,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,timestamp:C,isRead:!1},N={key:"WEIBO_COMMENT",data:U}}else{let G={target_post_id:i,author:"user"===B?"{{user}}":B,text:k,commentId:`comment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,timestamp:C,isRead:!1};N={key:"WEIBO_COMMENT",data:G}}w.addEntry(N),window.currentGameDate=new Date(C),console.log(`[BLMX Time Sync] World time advanced: ${window.currentGameDate.toLocaleString()}`),await w.persistLogToStorage(),e3(),e_(N.data),L.value="",await am(i)}catch(W){console.error("Weibo send error:",W),await showDialog({mode:"alert",text:"发送失败，请重试。"})}}),document.getElementById("weibo-detail-back-btn").addEventListener("click",()=>{let e=document.getElementById("weibo-detail-view"),t=e.dataset.postId;if(t){let a=eZ(t);a&&w.persistLogToStorage()}let i=O.posts.find(e=>e.postId===t);if(i&&i.category){let n=document.querySelector(`.weibo-zone-card[data-category="${i.category}"]`),l=n?n.querySelector(".zone-title").textContent:"帖子列表";ep("weiboFeed",{category:i.category,categoryName:l}),eD(i.category)}else ep("weibo")}),document.getElementById("chat-back-btn").addEventListener("click",()=>{ep(Q),"contacts"===Q&&td()}),document.getElementById("settings-back-btn").addEventListener("click",()=>ep("home")),document.getElementById("group-settings-back-btn").addEventListener("click",()=>ep("wechatChat",{conversationId:document.getElementById("group-settings-view").dataset.conversationId})),document.getElementById("contact-details-back-btn").addEventListener("click",()=>{T?ep("wechatChat",{conversationId:T}):ep("wechatList")}),document.getElementById("set-char-appearance-btn").addEventListener("click",async()=>{let e=document.getElementById("contact-details-profile-card").dataset.contactId,t=_.find(t=>t.id===e);if(!t)return;let a=t.nai_appearance||"",i=await showDialog({mode:"prompt",text:`【设置 ${ed(t.id,null)} 的外貌特征】

请填写固定的外貌Tag (英文最佳，中文会自动翻译)。
AI生成视频画面时会强制使用这些特征。

示例: 1girl, silver hair, purple eyes, maid outfit`,defaultValue:a});null!==i&&(t.nai_appearance=i.trim(),el(),await showDialog({mode:"alert",text:"外貌设定已保存！下次视频通话时生效。"}))}),document.getElementById("wechat-list-back-btn").addEventListener("click",()=>ep("home")),document.getElementById("dynamic-island").addEventListener("click",()=>{b||eU(!0)}),document.getElementById("chat-options-btn").addEventListener("click",()=>{let e=C.find(e=>e.id===T);if("single"===e.type){let t=e.members.find(e=>"user"!==e);ep("contactDetails",{contactId:t})}else"group"===e.type&&ep("groupSettings",{conversationId:T})}),document.getElementById("me-view-moments-btn").addEventListener("click",()=>{ep("moments")}),document.getElementById("me-profile-card").addEventListener("click",()=>eK("user")),document.getElementById("contact-details-avatar").addEventListener("click",e=>{let t=e.target.dataset.contactId;t&&ep("moments",{authorId:t})}),document.getElementById("moments-back-btn").addEventListener("click",()=>{S?(S=null,eB(null)):ep("wechatList")}),p.addEventListener("click",()=>{if(b)return;let e=m.value.trim();if(e){e1({type:"message",sender:"user",content:e}),m.value="";let t=new Date(window.currentGameDate).toISOString();eS(T,t),el(),ts(),eX(),delete $[T];return}(E.length>0||I)&&eU(!0)}),document.getElementById("hidden-send-trigger").addEventListener("click",()=>{b||eU(!0)}),m.addEventListener("keydown",e=>{if("Enter"===e.key&&!e.shiftKey){e.preventDefault();let t=m.value.trim();if(t){e1({type:"message",sender:"user",content:t}),m.value="";let a=new Date(window.currentGameDate).toISOString();eS(T,a),el(),ts(),eX(),delete $[T]}}}),m.addEventListener("input",eX),m.addEventListener("focus",()=>ta(null)),ex(m,async()=>{let e=m.placeholder,t=await showDialog({mode:"prompt",text:"请输入新的输入框提示文字:",defaultValue:e});null!==t&&(localStorage.setItem(`blmx_input_placeholder_${k}`,t),m.placeholder=t,await showDialog({mode:"alert",text:"提示文字已更新！"}))},{duration:5e3,preventDefault:!1}),document.getElementById("smile-btn").addEventListener("click",()=>ta("sticker")),u.addEventListener("click",()=>ta("plus")),document.getElementById("microphone-btn").addEventListener("click",async()=>{let e=await showDialog({mode:"prompt",text:"请输入语音内容:"});if(null!==e&&e){let t=await showDialog({mode:"prompt",text:"请输入语音秒数 (只输入数字):"});if(null!==t){let a=parseInt(t,10);!isNaN(a)&&a>0?e1({type:"voice",sender:"me",content:{text:e,duration:a}}):await showDialog({mode:"alert",text:"请输入有效的秒数。"})}}});let eQ=document.getElementById("wechat-plus-btn"),te=document.getElementById("plus-menu");function tt(e,t,a,i){let n=i?[...t]:["user",...t];n.includes(a)||n.push(a);let l=[...new Set(n)],r=ap(l),o={id:r,type:"group",name:e,members:l,owner:a,admins:[],avatar:"",unread:0,pinned:!1,lastActivity:new Date(window.currentGameDate).getTime(),userIsObserver:i,dissolved:!1,nicknames:{}},s={type:"create",convoId:r,author:a,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," ")};w.addEntry({type:"group_event",content:s}),C.push(o),el(),w.persistLogToStorage().then(()=>{ts(),document.getElementById("group-chat-name-input").value="",document.getElementById("group-chat-modal").style.display="none",ep("wechatChat",{conversationId:o.id})})}async function ti(){var e;let t=await af({title:"创建虚拟群聊",fields:[{id:"name",label:"群聊名称",type:"text",defaultValue:""},{id:"desc",label:"背景成员描述 (给AI看)",type:"textarea",defaultValue:"一群符合当前情景的、性格各异的路人。"}]});if(null===t||!t.name.trim()){await showDialog({mode:"alert",text:"创建已取消或群聊名称为空。"});return}let a=await (e=t.name,new Promise(e=>{let t=document.getElementById("group-chat-modal"),a=document.getElementById("group-chat-contact-list-container"),i=document.getElementById("group-chat-confirm-btn"),n=document.getElementById("group-chat-cancel-btn");a.innerHTML="",document.getElementById("group-chat-modal-footer").style.display="none",i.style.display="block",i.textContent="完成",document.getElementById("group-chat-modal-title").textContent=`邀请核心成员 (可选)`,_.forEach(e=>{let t=document.createElement("div");t.className="group-chat-contact-item",t.innerHTML=`
							<input type="checkbox" id="vg-contact-${e.id}" data-contact-id="${e.id}">
							<img src="${ec(e.id)}" alt="${ed(e.id,null)}">
							<label for="vg-contact-${e.id}">${ed(e.id,null)}</label>
						`,a.appendChild(t)});let l=a=>{t.style.display="none",r.onclick=null,o.onclick=null,e(a)},r=i.cloneNode(!0);i.parentNode.replaceChild(r,i);let o=n.cloneNode(!0);n.parentNode.replaceChild(o,n),o.onclick=()=>l(null),r.onclick=()=>{let e=[];a.querySelectorAll("input:checked").forEach(t=>{e.push(t.dataset.contactId)}),l(e)},t.style.display="flex"}));if(null===a){await showDialog({mode:"alert",text:"创建已取消。"});return}let i=[...new Set(["user",...a])],n=`convo_vgroup_${Date.now()}`,l={id:n,type:"vgroup",name:t.name.trim(),members:i,background_members_desc:t.desc.trim(),owner:"user",unread:0,pinned:!1,lastActivity:new Date(window.currentGameDate).getTime()};C.push(l),el(),ts(),await showDialog({mode:"alert",text:`虚拟群聊 "${l.name}" 创建成功！`}),ep("wechatChat",{conversationId:l.id})}eQ.addEventListener("click",e=>{e.stopPropagation(),te.style.display="block"===te.style.display?"none":"block"}),document.body.addEventListener("click",e=>{"block"!==te.style.display||te.contains(e.target)||e.target===eQ||(te.style.display="none")}),document.getElementById("plus-menu-add-friend").addEventListener("click",async()=>{let e=await af({title:"添加朋友",fields:[{id:"name",label:"朋友的真实姓名 (这将作为唯一ID)",type:"text"},{id:"avatarUrl",label:"朋友的头像URL (可选)",type:"text"}]});if(null===e)return;let{name:t,avatarUrl:a}=e;if(t&&t.trim()){let i=t.trim();if(_.some(e=>e.id===i)||"user"===i){await showDialog({mode:"alert",text:"该联系人已存在或名字非法！"});return}let n={id:i,name:i,avatar:a||"",signature:"",cover:""};_.push(n);let l={id:`convo_single_${i}`,type:"single",members:["user",n.id],unread:0,pinned:!1,lastActivity:Date.now()};C.push(l),el(),ts(),await showDialog({mode:"alert",text:`"${n.name}" 已添加！`})}else await showDialog({mode:"alert",text:"朋友的姓名不能为空！"})}),document.getElementById("plus-menu-scan").addEventListener("click",async()=>{te.style.display="none";let e=await showDialog({mode:"confirm",text:"您扫描的是一个虚拟群聊邀请码，是否要创建一个新的虚拟群聊？"});e&&await ti()}),document.getElementById("plus-menu-group-chat").addEventListener("click",async()=>{if(_.length<1){await showDialog({mode:"alert",text:"请至少添加一个朋友才能发起群聊！"});return}let e=document.getElementById("group-chat-modal"),t=document.getElementById("group-chat-contact-list-container");t.innerHTML="",document.getElementById("group-chat-modal-title").textContent="选择联系人",document.getElementById("group-chat-modal-footer").style.display="block",document.getElementById("group-chat-confirm-btn").style.display="none",_.forEach(e=>{let a=document.createElement("div");a.className="group-chat-contact-item",a.innerHTML=`
                    <input type="checkbox" id="gc-contact-${e.id}" data-contact-id="${e.id}">
                    <img src="${ec(e.id)}" alt="${ed(e.id,null)}">
                    <label for="gc-contact-${e.id}">${ed(e.id,null)}</label>
                `,t.appendChild(a)}),e.dataset.mode="create",e.style.display="flex"}),document.getElementById("group-chat-cancel-btn").addEventListener("click",()=>{document.getElementById("group-chat-modal").style.display="none"}),document.getElementById("group-chat-create-btn").addEventListener("click",async()=>{let e=[];document.querySelectorAll("#group-chat-contact-list-container input:checked").forEach(t=>{e.push(t.dataset.contactId)});let t=document.getElementById("group-chat-name-input"),a=t.value.trim();if(e.length<1){await showDialog({mode:"alert",text:"请至少选择一个联系人来创建群聊。"});return}if(!a){await showDialog({mode:"alert",text:"请为群聊起一个名字。"});return}let i=await showDialog({mode:"confirm",text:"您是否要加入这个群聊？\n(确定 = 正常加入)\n(取消 = 上帝视角观察)"});i?tt(a,e,"user",!1):function e(t,a){document.getElementById("group-chat-modal").style.display="none";let i=document.getElementById("group-owner-modal"),n=document.getElementById("group-owner-list-container");n.innerHTML="",a.forEach((e,t)=>{let a=document.createElement("div");a.className="group-owner-item",a.innerHTML=`
                         <input type="radio" name="group-owner" id="owner-${e}" value="${e}" ${0===t?"checked":""}>
                         <img src="${ec(e)}" alt="${ed(e,null)}">
                         <label for="owner-${e}">${ed(e,null)}</label>
                    `,n.appendChild(a)}),i.style.display="flex",document.getElementById("group-owner-confirm-btn").onclick=async()=>{let e=n.querySelector('input[name="group-owner"]:checked');e?(tt(t,a,e.value,!0),i.style.display="none"):await showDialog({mode:"alert",text:"请选择一位群主！"})}}(a,e)}),document.getElementById("post-moment-btn").addEventListener("click",async()=>{let e=await af({title:"发布新动态",fields:[{id:"text",label:"这一刻的想法...",type:"textarea"},{id:"image_url",label:"图片链接 (可选)",type:"text"},{id:"image_desc",label:"或 图片描述 (可选)",type:"text"},{id:"timestamp",label:"发布时间",type:"text",defaultValue:new Date(window.currentGameDate).toISOString().slice(0,16).replace("T"," ")}]});if(null===e)return;let{text:t,image_url:a,image_desc:n,timestamp:l}=e,r="",o="none";if(a.trim()?(o="url",r=a.trim()):n.trim()&&(o="desc",r=n.trim()),!t.trim()&&!r.trim()){await showDialog({mode:"alert",text:"不能发布空的朋友圈内容。"});return}if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(l.trim())){await showDialog({mode:"alert",text:"时间格式不正确，应为 YYYY-MM-DD HH:mm"});return}let s=await showDialog({mode:"confirm",text:"是否发布为私密朋友圈？"}),d=[],c=[];if(!s&&await showDialog({mode:"confirm",text:"是否要设置部分可见/不可见？"})){let m=await showDialog({mode:"confirm",text:"设置为“部分可见”吗？\n(确定 = 部分可见, 取消 = 不给谁看)"}),p=await showDialog({mode:"prompt",text:"请输入联系人ID，用英文逗号分隔:"});if(p){let u=p.split(",").map(e=>e.trim()).filter(Boolean);m?d=u:c=u}}let g={author:"user",text:t,image:r,image_type:o,timestamp:l.trim(),isPrivate:s,visibleTo:d,invisibleTo:c,momentId:`moment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`};w.addEntry({key:"MOMENT",data:g}),"desc"===g.image_type&&g.image&&i(g.momentId,g.image,"moment"),w.persistLogToStorage(),eB(S)}),h.addEventListener("click",async e=>{let t=e.target.closest(".moment-post");if(!t)return;let a=t.dataset.momentId,i=t.dataset.authorId;if(e.target.classList.contains("post-author-avatar")){i&&ep("moments",{authorId:i});return}let n=w.logEntries.find(e=>"MOMENT"===e.key&&e.data.momentId===a);if(!n){console.error("Error: Could not find moment entry in log for ID:",a);return}let l=e.target.closest("[data-action]");if(l){let r=l.dataset.action;switch(r){case"forward":{let o=n.data.momentId;ak([o],"forward");break}case"like":{let s=w.logEntries.some(e=>"CHAR_LIKE"===e.key&&e.data.target_post_id===a&&("user"===e.data.author||"{{user}}"===e.data.author));if(s){console.log(`[BLMX Moments] Post ${a} is already liked by user. No action taken.`);return}w.addEntry({key:"CHAR_LIKE",data:{author:"user",target_post_id:a}}),I=!0,await w.persistLogToStorage(),eB(S),eX(),await ty(a,null);break}case"reply":{let d=await showDialog({mode:"prompt",text:"请输入评论内容:"});if(null!==d&&d.trim()){let c={author:"user",text:d.trim(),target_post_id:a};w.addEntry({key:"CHAR_COMMENT",data:c}),await w.persistLogToStorage(),eB(S),I=!0,eX(),await ty(a,d.trim())}}}return}if(e.target.closest(".private-icon")&&"user"===i)await showDialog({mode:"confirm",text:"要将这条私密动态公开吗？"})&&(n.data.isPrivate=!1,await w.persistLogToStorage(),eB(S));else if(e.target.closest(".visibility-icon")){let{visibleTo:m,invisibleTo:p}=n.data,u="可见性设置：\n";m&&m.length>0&&(u+=`部分可见: ${m.map(e=>ed(e,null)).join(", ")}
`),p&&p.length>0&&(u+=`不给谁看: ${p.map(e=>ed(e,null)).join(", ")}
`),await showDialog({mode:"alert",text:u})}else e.target.closest(".delete-moment-btn")&&await tf(a)}),c.addEventListener("click",e=>{if(e.target.matches(".message-avatar")){let t=e.target.dataset.senderId;if(!t)return;let a=C.find(e=>e.id===T);if(a&&"single"===a.type&&"user"!==t)eK(t);else if(a&&"group"===a.type&&"user"!==t&&!a.userIsObserver){let i=`@${ed(t,a.id)} `;m.value+=i,m.focus()}}}),document.getElementById("delete-contact-btn").addEventListener("click",async e=>{let t=e.target.closest("#contact-details-view").querySelector("#contact-details-profile-card"),a=t.dataset.contactId,i=_.find(e=>e.id===a);if(!i)return;let n=await showDialog({mode:"confirm",text:`确定要删除联系人 "${ed(i.id,null)}" 吗？

此操作将清除与该联系人的所有聊天记录，并将其从所有群聊中移除，且不可恢复。`});if(n){_=_.filter(e=>e.id!==a);let l=C.filter(e=>"single"===e.type&&e.members.includes(a)),r=l.map(e=>e.id);C=C.filter(e=>!r.includes(e.id)),w.logEntries=w.logEntries.filter(e=>{let t=e.conversationId||e.convoId||e.content&&e.content.convoId||e.data&&e.data.convoId;return!r.includes(t)}),C.forEach(e=>{"group"===e.type&&e.members.includes(a)&&(e.members=e.members.filter(e=>e!==a))}),el(),await w.persistLogToStorage(),await showDialog({mode:"alert",text:`联系人 "${ed(i.id,null)}" 已被彻底删除。`}),ep("contacts"),td()}}),document.getElementById("contact-name-header").addEventListener("click",async e=>{let t=C.find(e=>e.id===T);if(!t||"single"!==t.type)return;let a=t.members.find(e=>"user"!==e),i=_.find(e=>e.id===a);if(!i)return;let n=i.remark||"",l=await showDialog({mode:"prompt",text:`为 "${i.name}" 设置备注:`,defaultValue:n});null!==l&&(i.remark=l.trim(),el(),e.target.textContent=ed(a,t.id),ts())}),document.getElementById("moments-user-name").addEventListener("click",async()=>{let e=document.getElementById("moments-user-name").textContent,t=document.getElementById("moments-user-avatar").src===ec("user")?"user":_.find(t=>ed(t.id,null)===e)?.id;if("user"===t){let a=await showDialog({mode:"prompt",text:"请输入你的新名字:",defaultValue:A.name});a&&a.trim()&&a!==A.name&&(A.name=a.trim(),el(),eB("user"),await showDialog({mode:"alert",text:"名字已更新！"}))}else{let i=_.find(e=>e.id===t);i&&await showDialog({mode:"alert",text:`你不能修改 ${i.name} 的名字。`})}}),document.getElementById("moments-user-avatar").addEventListener("click",async()=>{let e=document.getElementById("moments-user-name").textContent,t=document.getElementById("moments-user-avatar").src===ec("user")?"user":_.find(t=>ed(t.id,null)===e)?.id,a="user"===t?A:_.find(e=>e.id===t);if(a){let i=a.signature||"",n=await showDialog({mode:"prompt",text:"请输入个性签名:",defaultValue:i});null!==n&&(a.signature=n,el(),eB(a.id))}}),document.getElementById("delete-mode-trigger").addEventListener("click",async()=>{let e=document.getElementById("wechat-chat-view");e.classList.toggle("delete-mode"),e.classList.contains("delete-mode")?await showDialog({mode:"alert",text:"已进入删除模式。点击任意消息或时间戳可将其删除。再次点击左上角可退出。"}):await showDialog({mode:"alert",text:"已退出删除模式。"})}),c.addEventListener("click",async e=>{let t=document.getElementById("wechat-chat-view");if(!t.classList.contains("delete-mode"))return;let a=e.target.closest("[data-log-index]");if(a){e.preventDefault(),e.stopPropagation();let i=parseInt(a.dataset.logIndex,10),n=a.textContent.trim().replace(/\s+/g," ").substring(0,50),l=await showDialog({mode:"confirm",text:`确定要删除这条记录吗？

预览: "${n}..."`});l&&(w.logEntries.splice(i,1),w.persistLogToStorage(),e$(T),eB(S))}},!0),document.getElementById("image-upload-input").addEventListener("change",e=>{let t=e.target.files[0];if(t){let a=new FileReader;a.onload=async e=>{let t=e.target.result;try{e1({type:"image",sender:"me",content:{type:"url",value:t}}),ta(null)}catch(a){await showDialog({mode:"alert",text:"图片太大无法发送，请选择一张小一点的图片。"}),console.error("Error with image:",a)}},a.readAsDataURL(t)}e.target.value=null}),document.getElementById("group-settings-avatar-btn").addEventListener("click",async()=>{let e=document.getElementById("group-settings-view").dataset.conversationId,t=C.find(t=>t.id===e);if(!t)return;let a=await showDialog({mode:"prompt",text:"请输入新的群聊头像URL:",defaultValue:t.avatar||""});null!==a&&(t.avatar=a,el(),ts(),await showDialog({mode:"alert",text:"群头像已更新。"}))}),document.getElementById("group-settings-name-item").addEventListener("click",async()=>{let e=document.getElementById("group-settings-view").dataset.conversationId,t=C.find(t=>t.id===e);if(!t||t.userIsObserver)return;let a=await showDialog({mode:"prompt",text:"请输入新的群聊名称:",defaultValue:t.name});if(a&&a.trim()){let i={type:"rename",convoId:t.id,author:A.id,newName:a.trim(),timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," ")};w.addEntry({type:"group_event",content:i}),ek(i),t.name=a.trim(),t.lastActivity=Date.now(),w.persistLogToStorage(),el(),document.getElementById("group-settings-name").textContent=t.name,document.getElementById("contact-name-header").textContent=`${t.name} (${t.members.length})`}}),document.getElementById("group-settings-member-grid").addEventListener("click",async e=>{let t=e.target.closest(".group-member-item"),a=e.target.closest(".add-member-btn"),i=document.getElementById("group-settings-view").dataset.conversationId,n=C.find(e=>e.id===i);if(n){if(a){if(n.userIsObserver){await showDialog({mode:"alert",text:"你不能向这个群里添加成员。"});return}ak([],"addMember");return}if(t){if(n.userIsObserver||"user"===t.dataset.memberId)return;let l=t.dataset.memberId;tp(l,i,e)}}}),document.getElementById("group-chat-confirm-btn").addEventListener("click",async()=>{let e=document.getElementById("group-chat-modal"),t=e.dataset.mode;if("forward"===t){let a=e.querySelector('input[name="forward-target"]:checked');if(a){let i=a.value,n=JSON.parse(e.dataset.messageIds),l="聊天记录";if(n.length>0&&n[0].startsWith("moment_")){let r=parseInt(n[0].replace("moment_",""),10);w.logEntries[r],l=`转发的动态`}else{let o=C.find(e=>e.id===T),s="single"===o.type?ed(o.members.find(e=>"user"!==e),o.id):o.name;l=`“${ed("user",null)}”和“${s}”的聊天记录`}let d={title:l,messageIds:n};a8(),ep("wechatChat",{conversationId:i}),e1({type:"forward",sender:"me",data:d}),e.style.display="none"}else await showDialog({mode:"alert",text:"请选择一个转发目标。"})}else if("shareMusic"===t){let c=e.querySelector('input[name="forward-target"]:checked');if(c){let m=c.value,p=JSON.parse(e.dataset.messageIds),u={type:"music_share",sender:"me",conversationId:m,data:p,timestamp:new Date(window.currentGameDate).toISOString()};w.addEntry(u),eS(m,u.timestamp),await w.persistLogToStorage(),el(),e.style.display="none",ep("wechatChat",{conversationId:m}),T===m&&e$(m)}else await showDialog({mode:"alert",text:"请选择一个分享目标。"})}else if("addMember"===e.dataset.mode){let g=e.dataset.convoId,y=C.find(e=>e.id===g);if(!y)return;let f=[];if(document.querySelectorAll("#group-chat-contact-list-container input:checked").forEach(e=>{f.push(e.dataset.contactId)}),0===f.length){await showDialog({mode:"alert",text:"请至少选择一个要添加的成员。"});return}y.members.push(...f),y.lastActivity=Date.now();let h={type:"add",convoId:g,author:A.id,targetIds:f,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," ")};w.addEntry({type:"group_event",content:h}),e$(g),w.persistLogToStorage(),el(),e.style.display="none",ep("groupSettings",{conversationId:g})}else if("selectRecipient"===e.dataset.mode){let b=e.querySelector('input[name="recipient-target"]:checked');if(b){let v=b.value,E=e.dataset.itemType,I=JSON.parse(e.dataset.itemData);I.recipientId=v,e1({type:E,sender:"me",data:I}),e.style.display="none",ta(null)}else await showDialog({mode:"alert",text:"请选择一个接收者。"})}}),document.getElementById("group-dissolve-btn").addEventListener("click",async e=>{let t=document.getElementById("group-settings-view").dataset.conversationId,a=C.find(e=>e.id===t);if(!a)return;let i=e.currentTarget.dataset.action;if("dissolve"===i){if("user"!==a.owner){await showDialog({mode:"alert",text:"你不是群主，无法解散该群。"});return}let n=await showDialog({mode:"confirm",text:"是否保留此群聊的聊天记录？\n(确定 = 存档群聊，可恢复)\n(取消 = 彻底删除)"});if(n)a.dissolved=!0,a.archived=!0;else{let l=C.findIndex(e=>e.id===t);l>-1&&C.splice(l,1),w.logEntries=w.logEntries.filter(e=>(e.conversationId||e.convoId)!==t)}let r={type:"dissolve",convoId:t,author:A.id,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," ")};w.addEntry({type:"group_event",content:r}),w.persistLogToStorage(),el(),ep("wechatList")}else if("recover"===i)a.dissolved=!1,a.archived=!1,await showDialog({mode:"alert",text:"群聊已恢复！"}),el(),ep("groupSettings",{conversationId:a.id});else if("delete"===i){let o=await showDialog({mode:"confirm",text:"是否保留此群聊的聊天记录？\n(确定 = 仅删除聊天入口)\n(取消 = 彻底删除聊天和记录)"}),s=C.findIndex(e=>e.id===t);s>-1&&C.splice(s,1),o||(w.logEntries=w.logEntries.filter(e=>(e.conversationId||e.convoId)!==t),w.persistLogToStorage()),el(),ep("wechatList")}}),document.getElementById("observer-poke-btn").addEventListener("click",()=>{eU(!0,!0)}),document.getElementById("observer-screenshot-btn").addEventListener("click",()=>{aS()}),document.getElementById("set-private-chat-wallpaper-btn").addEventListener("click",to(null,!0)),document.getElementById("group-settings-wallpaper-btn").addEventListener("click",to(en.chat,!1)),document.getElementById("show-last-ai-response-btn").addEventListener("click",e=>{e.preventDefault(),showDebugWindow("AI最新原始回复",M,"#72adf3")}),document.getElementById("show-last-prompt-btn").addEventListener("click",e=>{e.preventDefault(),showDebugWindow("发送给AI的最新提示",N,"#81c784")}),document.getElementById("forward-cancel-btn").addEventListener("click",a8),document.getElementById("forward-confirm-btn").addEventListener("click",aL),document.querySelector("#forward-content-modal .close-btn").addEventListener("click",()=>{document.getElementById("forward-content-modal").style.display="none"});let tn=document.getElementById("settings-view");tn&&tn.addEventListener("click",function(e){if(e.target.matches(".tutorial-container .toc a")){e.preventDefault();let t=e.target.getAttribute("href"),a=t.substring(1),i=document.querySelector("#settings-view .settings-body"),n=document.getElementById(a);if(n&&i){let l=n.offsetTop;i.scrollTo({top:l-i.offsetTop-15,behavior:"smooth"})}}})}(),ay(),function e(){let t=localStorage.getItem(`blmx_global_theme_${k}`);if(t)try{let a=JSON.parse(t);for(let i in a){let n=a[i],l=globalThemeVariableMap[i];if(l&&"range"===l.type&&l.unit&&n&&!isNaN(parseFloat(n))&&!String(n).endsWith(l.unit)&&(n+=l.unit),l&&"imageUrl"===l.type)n=n?`url('${n}')`:"none";else if(n.startsWith("#")){let r=hexToRgba(n);r&&(n=`rgba(${r.r}, ${r.g}, ${r.b}, ${r.a})`)}document.documentElement.style.setProperty(i,n)}console.log("[BLMX Theme] Successfully applied saved global theme (with auto-fix).")}catch(o){console.error("[BLMX Theme] Failed to parse or apply saved theme:",o)}}(),function e(){let t=`blmx_bubble_theme_${k}`,a=localStorage.getItem(t);if(a)try{let i=JSON.parse(a);for(let n in i)for(let l in i[n]){let r=i[n][l];if(document.documentElement.style.setProperty(l,r),l.includes("wiggle-scale")){let o=l.includes("-me-")?"me":"them",s=document.getElementById(`wiggle-map-${o}`);s&&s.setAttribute("scale",r)}}console.log(`[Bubble Workshop] Initial theme applied successfully from key: ${t}`)}catch(d){console.error("[Bubble Workshop] Failed to apply saved theme on startup:",d)}}(),ax(),ep("wechatList"),tc(),eX(),function e(){let t=`blmx_forum_font_size_${k}`,a=localStorage.getItem(t);a&&(document.documentElement.style.setProperty("--forum-font-size",`${a}em`),console.log(`[BLMX Forum Theme] Applied saved font size (${a}em) on startup.`))}(),function e(){let t=`blmx_forum_theme_${k}`,a=localStorage.getItem(t),i="dark"===a,n=[document.getElementById("weibo-view"),document.getElementById("weibo-feed-view"),document.getElementById("weibo-detail-view"),document.getElementById("forum-profile-view")];n.forEach(e=>{e&&e.classList.toggle("forum-dark-mode",i)}),i&&console.log("[BLMX Theme] Applied saved dark mode to FORUM views (including profile page) on startup.")}(),function e(){let t=localStorage.getItem(t$);t&&(document.getElementById("font-css-input").value=t,tk(t),console.log("[BLMX Font Studio] Successfully applied saved custom font on startup."))}(),function e(){let t=document.getElementById("novelai-switch"),a=document.getElementById("novelai-details"),i=document.getElementById("novelai-header-toggle"),n=document.getElementById("novelai-chevron"),l=document.getElementById("novelai-api-key"),r=document.getElementById("novelai-model"),o=document.getElementById("novelai-resolution"),s=document.getElementById("nai-positive"),d=document.getElementById("nai-negative"),c=document.getElementById("novelai-key-toggle"),m=document.getElementById("nai-test-btn"),p=document.getElementById("nai-test-prompt"),u=document.getElementById("nai-test-preview"),g=document.getElementById("nai-preview-img"),y="true"===localStorage.getItem(`blmx_nai_enabled_${k}`),f=localStorage.getItem(`blmx_nai_key_${k}`)||"",h=localStorage.getItem(`blmx_nai_model_${k}`)||"nai-diffusion-3",b=localStorage.getItem(`blmx_nai_res_${k}`)||"1024x1024",v=localStorage.getItem(`blmx_nai_positive_${k}`)??"masterpiece, best quality, absurdres, very aesthetic, detailed, anime style, 2d, cinematic lighting",w=localStorage.getItem(`blmx_nai_negative_${k}`)??"lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, 3d, realistic";t.checked=y,a.style.display="none",n&&(n.style.transform="rotate(0deg)"),l.value=f,r.value=h,o.value=b,s.value=v,d.value=w;let E=(e,t)=>e.addEventListener("input",e=>localStorage.setItem(t,e.target.value)),I=(e,t)=>e.addEventListener("change",e=>localStorage.setItem(t,e.target.value));E(l,`blmx_nai_key_${k}`),I(r,`blmx_nai_model_${k}`),I(o,`blmx_nai_res_${k}`),E(s,`blmx_nai_positive_${k}`),E(d,`blmx_nai_negative_${k}`),t.addEventListener("change",e=>{let t=e.target.checked;localStorage.setItem(`blmx_nai_enabled_${k}`,t),a.style.display=t?"block":"none",n&&(n.style.transform=t?"rotate(90deg)":"rotate(0deg)")}),i&&i.addEventListener("click",()=>{let e="block"===a.style.display;a.style.display=e?"none":"block",n&&(n.style.transform=e?"rotate(0deg)":"rotate(90deg)")}),c.addEventListener("click",()=>{let e="password"===l.type;l.type=e?"text":"password",c.style.opacity=e?"1":"0.6"}),m&&m.addEventListener("click",async()=>{let e=p.value.trim();if(!e)return showDialog({mode:"alert",text:"请输入测试提示词！"});m.disabled=!0,m.innerHTML='<i class="fas fa-spinner fa-spin"></i> 生成中...',u.style.display="none";try{let t=s.value,a=[t,e].filter(e=>e.trim()).join(", "),i=await tz(a);g.src=i,u.style.display="block",g.onclick=null}catch(n){console.error(n),showDialog({mode:"alert",text:"生成失败: "+n.message})}finally{m.disabled=!1,m.innerHTML='<i class="fas fa-magic"></i> 测试生成'}}),console.log("[NovelAI] Initialization complete (Collapsible).")}(),function e(){let t=localStorage.getItem(`blmx_current_song_${k}`);if(t)try{Object.assign(currentSong,JSON.parse(t))}catch(a){console.error("读取歌曲缓存失败",a)}tO();let i=document.getElementById("lt-song-title"),n=document.getElementById("lt-artist-name");i&&(i.textContent=currentSong.title),n&&(n.textContent=currentSong.artist),currentSong.lrc&&(tA(currentSong.lrc),tM()),globalAudio.src=currentSong.src,globalAudio.addEventListener("timeupdate",()=>{if(!isDraggingProgress){let e=globalAudio.currentTime,t=globalAudio.duration||0,a=document.getElementById("lt-progress-slider");a&&(a.value=e/t*100||0);let i=document.getElementById("lt-current-time");i&&(i.textContent=tP(e));let n=document.getElementById("lt-total-duration");n&&(n.textContent=tP(t))}!function e(t){if(0===tC.length)return;let a=tC.findIndex(e=>e.time>t)-1;a<0&&(a=0===tC.findIndex(e=>e.time>t)?0:tC.length-1);let i=document.getElementById("lt-lyrics-wrapper"),n=document.getElementById("lt-lyrics-scroll-area");if(!i||!n)return;let l=i.querySelectorAll("p"),r=l[a],o=i.querySelector(".active");if(r&&o!==r){o&&o.classList.remove("active"),r.classList.add("active");let s=r.offsetTop-n.clientHeight/2+r.offsetHeight/2;n.scrollTo({top:s,behavior:"smooth"})}}(globalAudio.currentTime)}),globalAudio.addEventListener("ended",()=>{tY("next",!0)})}()}function a$(e,t){let a=document.getElementById("group-chat-modal"),i=document.getElementById("group-chat-contact-list-container");i.innerHTML="",document.getElementById("group-chat-modal-footer").style.display="none",document.getElementById("group-chat-confirm-btn").style.display="block",a.dataset.mode="selectRecipient",a.dataset.itemType=e,a.dataset.itemData=JSON.stringify(t);let n=C.find(e=>e.id===T);n&&(document.getElementById("group-chat-modal-title").textContent="选择一个接收者",n.members.filter(e=>"user"!==e).forEach(e=>{let t=ed(e,n.id),a=ec(e),l=document.createElement("div");l.className="group-owner-item",l.innerHTML=`<input type="radio" name="recipient-target" id="target-${e}" value="${e}"><img src="${a}" alt="${t}"><label for="target-${e}">${t}</label>`,i.appendChild(l)}),a.style.display="flex")}function a8(){document.getElementById("wechat-chat-view").classList.remove("forward-mode");let e=C.find(e=>e.id===T);e&&(e.userIsObserver?(document.querySelector(".wechat-input-area").style.display="none",document.getElementById("observer-mode-footer").style.display="flex"):(document.querySelector(".wechat-input-area").style.display="block",document.getElementById("observer-mode-footer").style.display="none")),document.getElementById("forward-action-bar").style.display="none",document.querySelectorAll(".forward-checkbox").forEach(e=>e.checked=!1)}async function aL(){let e=[];if(document.querySelectorAll(".forward-checkbox:checked").forEach(t=>{e.push(t.dataset.messageId)}),0===e.length){await showDialog({mode:"alert",text:"请至少选择一条要转发的记录。"});return}ak(e,"forward")}function ak(e,t){let a=document.getElementById("group-chat-modal"),i=document.getElementById("group-chat-contact-list-container"),n=document.getElementById("group-chat-confirm-btn"),l=document.getElementById("group-chat-cancel-btn");i.innerHTML="",document.getElementById("group-chat-modal-footer").style.display="none",n.style.display="block",a.dataset.mode=t;let r=n.cloneNode(!0);n.parentNode.replaceChild(r,n),r.addEventListener("click",aT);let o=l.cloneNode(!0);if(l.parentNode.replaceChild(o,l),o.addEventListener("click",()=>{a.style.display="none"}),"forward"===t||"shareMusic"===t)a.dataset.messageIds=JSON.stringify(e),document.getElementById("group-chat-modal-title").textContent="shareMusic"===t?"分享给...":"选择一个聊天",C.filter(e=>"moments_feed"!==e.id&&!e.userIsObserver).forEach(e=>{let t,a;if("group"===e.type||"vgroup"===e.type)t=e.avatar||"https://files.catbox.moe/bialj8.jpeg",a=`${e.name} (${e.members.length})`;else{let n=e.members.find(e=>"user"!==e);t=ec(n),a=ed(n,e.id)}let l=document.createElement("div");l.className="group-owner-item",l.innerHTML=`
<input type="radio" name="forward-target" id="target-${e.id}" value="${e.id}">
<img src="${t}" alt="${a}">
<label for="target-${e.id}">${a}</label>
`,l.addEventListener("click",()=>{let e=l.querySelector("input");e.checked=!0}),i.appendChild(l)});else if("addMember"===t){let s=document.getElementById("group-settings-view").dataset.conversationId;a.dataset.convoId=s;let d=C.find(e=>e.id===s);document.getElementById("group-chat-modal-title").textContent="邀请新成员";let c=_.filter(e=>!d.members.includes(e.id));c.forEach(e=>{let t=document.createElement("div");t.className="group-chat-contact-item",t.innerHTML=`<input type="checkbox" id="gc-add-contact-${e.id}" data-contact-id="${e.id}"><img src="${ec(e.id)}"><label for="gc-add-contact-${e.id}">${ed(e.id,null)}</label>`,i.appendChild(t)})}a.style.display="flex"}async function aT(){let e=document.getElementById("group-chat-modal"),t=e.dataset.mode;if("forward"===t){let a=e.querySelector('input[name="forward-target"]:checked');if(a){let i=a.value,n=JSON.parse(e.dataset.messageIds),l="转发的内容";if(n.length>0){let r=n[0];if("string"==typeof r&&r.startsWith("moment_"))l="转发的动态";else if(r.includes("weibo"))l="转发的帖子";else try{let o=JSON.parse(r);l="weibo_post"===o.type?"转发的帖子":"转发的聊天记录"}catch(s){l="转发的聊天记录"}}let d={title:l,messageIds:n};a8();let c={id:`msg-fwd-${Date.now()}-${Math.random()}`,type:"forward",sender:"user",conversationId:i,data:d,timestamp:new Date(window.currentGameDate).toISOString()};w.addEntry(c),eS(i,c.timestamp),await w.persistLogToStorage(),el(),e.style.display="none",ep("wechatChat",{conversationId:i})}else await showDialog({mode:"alert",text:"请选择一个转发目标。"})}else if("shareMusic"===t){let m=e.querySelector('input[name="forward-target"]:checked');if(m){let p=m.value;try{let u=JSON.parse(e.dataset.messageIds),g={title:u.title||"未知歌曲",artist:u.artist||"未知歌手"},y={id:`msg-share-${Date.now()}`,type:"music_share",sender:"user",conversationId:p,data:g,timestamp:new Date(window.currentGameDate).toISOString()};w.addEntry(y),eS(p,y.timestamp),await w.persistLogToStorage(),el(),e.style.display="none",ep("wechatChat",{conversationId:p}),T===p&&e$(p)}catch(f){console.error("分享音乐失败:",f),await showDialog({mode:"alert",text:"分享失败，数据解析错误。"})}}else await showDialog({mode:"alert",text:"请选择一个分享目标。"})}else if("addMember"===t){let h=e.dataset.convoId,b=C.find(e=>e.id===h);if(!b)return;let v=[];if(document.querySelectorAll("#group-chat-contact-list-container input:checked").forEach(e=>{v.push(e.dataset.contactId)}),0===v.length){await showDialog({mode:"alert",text:"请至少选择一个要添加的成员。"});return}b.members.push(...v),b.lastActivity=new Date(window.currentGameDate).getTime();let E={type:"add",convoId:h,author:A.id,targetIds:v,timestamp:new Date(window.currentGameDate).toISOString().substring(0,16).replace("T"," ")};w.addEntry({type:"group_event",content:E}),await w.persistLogToStorage(),el(),e.style.display="none",ep("groupSettings",{conversationId:h}),await showDialog({mode:"alert",text:"新成员已成功邀请！"})}else if("selectRecipient"===t){let I=e.querySelector('input[name="recipient-target"]:checked');if(I){let x=I.value,$=e.dataset.itemType,L=JSON.parse(e.dataset.itemData);L.recipientId=x,e1({type:$,sender:"me",data:L}),e.style.display="none",ta(null)}else await showDialog({mode:"alert",text:"请选择一个接收者。"})}}async function aS(){let e=await showDialog({mode:"confirm",text:"是否将手机外框一同截图？\n(确定 = 包含外框, 取消 = 仅聊天内容)"}),t=document.getElementById("panel-container"),a=document.querySelector("#wechat-chat-view .wechat-body");if(e){let i=document.querySelector(".phone-frame");await showDialog({mode:"alert",text:"正在准备带外框截图，请稍候..."});let n=t.classList.contains("active");n&&(t.style.display="none");try{html2canvas(i,{useCORS:!0,allowTaint:!0,backgroundColor:null}).then(async e=>{let t=document.createElement("a");t.download=`截图-带外框-${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.png`,t.href=e.toDataURL("image/png"),t.click(),await showDialog({mode:"alert",text:"带框截图已生成并开始下载！"})}).catch(async e=>{console.error("带框截图失败:",e),await showDialog({mode:"alert",text:"截图失败，详情请查看控制台。"})})}finally{n&&(t.style.display="")}}else{if(!a){await showDialog({mode:"alert",text:"无法找到聊天区域进行截图。"});return}await showDialog({mode:"alert",text:"正在准备长截图，请稍候... 页面可能会暂时变化。"});let l={height:a.style.height,overflowY:a.style.overflowY};a.scrollTop=0;try{a.style.height="auto",a.style.overflowY="visible",html2canvas(a,{useCORS:!0,allowTaint:!0,backgroundColor:getComputedStyle(a).backgroundColor,width:a.scrollWidth,height:a.scrollHeight,windowWidth:a.scrollWidth,windowHeight:a.scrollHeight}).then(async e=>{let t=document.createElement("a"),a=C.find(e=>e.id===T),i=a?a.name||ed(a.members.find(e=>"user"!==e),a.id):"chat";t.download=`长截图_${i}_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.png`,t.href=e.toDataURL("image/png"),t.click(),await showDialog({mode:"alert",text:"长截图已生成并开始下载！"})}).catch(async e=>{console.error("长截图失败:",e),await showDialog({mode:"alert",text:"长截图失败，这通常是由于聊天背景图跨域（CORS）策略导致的。"})})}finally{setTimeout(()=>{Object.assign(a.style,l),a.scrollTop=a.scrollHeight,console.log("截图流程结束，UI已恢复。")},200)}}}let aB=setInterval(()=>{window.parent&&window.parent.TavernHelper&&"function"==typeof window.parent.TavernHelper.generate&&(clearInterval(aB),console.log("[BLMX Proxy] Successfully connected to SillyTavern!"),a9())},250)}),document.addEventListener("DOMContentLoaded",()=>{updateAllClocks(),setInterval(updateAllClocks,1e3)}),document.addEventListener("DOMContentLoaded",()=>{let e=document.querySelector(".status-right"),t=document.querySelector(".phone-frame");e&&t&&(e.addEventListener("click",()=>{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(e=>{console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`)})}),document.addEventListener("fullscreenchange",()=>{document.fullscreenElement?(console.log("Entered fullscreen mode."),t.classList.add("fullscreen-active"),t.classList.remove("fullscreen-inactive")):(console.log("Exited fullscreen mode."),t.classList.add("fullscreen-inactive"),t.classList.remove("fullscreen-active"))}))}),window.downloadImage=function(e){let t=document.createElement("a");t.href=e,t.download=`nai_gen_${Date.now()}.png`,document.body.appendChild(t),t.click(),document.body.removeChild(t)};
