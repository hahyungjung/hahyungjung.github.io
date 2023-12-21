
var audio = new Audio('assets/message_sound.mp3');
var contactString = "<div class='social'> <a target='_blank' href='tel:+1 516-951-2173'> <div class='socialItem' id='call'><img class='socialItemI' src='images/phone.svg'/><label class='number'>5169512173</label></div> </a> <a href='mailto:hajung2@ivyent.com'> <div class='socialItem'><img class='socialItemI' src='images/gmail.svg' alt=''></div> </a> ";
var budgetString = "<img src='images/budgetThumbnail.png' class='budgetThumbnail'><div class='downloadSpace'><div class='pdfname'><img src='images/pdf.png'><label>Budget Instruction Manual.pdf</label></div><a href='assets/budget_manual.pdf' download='budget_manual.pdf'><img class='download' src='images/downloadIcon.svg'></a></div>";
var addressString = "<div class='mapview'><iframe src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3019.7659747085922!2d-73.66006338865412!3d40.81113617125951!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c288a44cff326b%3A0x17ec7b8077b045d2!2sKISS%20Products%2C%20Inc.!5e0!3m2!1sen!2sus!4v1702827155405!5m2!1sen!2sus' class='map'></iframe></div><label class='add'><address>SOM - Located in the challenge zone on the second floor <br>25 Harbor Park Dr, Port Washington, NY 11050</address>";


let qnaModel;


let messageId = 0;

function sendSystemMessage(message) {
    var myLI = document.createElement("li");
    myLI.id = 'message-' + messageId; 
    var myDiv = document.createElement("div");
    var textDiv = document.createElement("div");
    var date = new Date();
    var dateLabel = document.createElement("label");
    dateLabel.innerText = date.getHours() + ":" + date.getMinutes();
    myDiv.setAttribute("class", "system");
    textDiv.setAttribute("class", "system-message");
    textDiv.innerHTML = message;
    myDiv.appendChild(textDiv);
    myLI.appendChild(myDiv);
    textDiv.appendChild(dateLabel);
    document.getElementById("listUL").appendChild(myLI);
    return messageId++; 
}

function removeMessage(messageId) {
    var messageElement = document.getElementById('message-' + messageId);
    if (messageElement) {
        messageElement.parentNode.removeChild(messageElement);
    }
}

async function loadQnAModel() {
    let startMessageId, endMessageId;
    try {
        startMessageId = sendTextMessage("QnA 모델 로딩을 시작합니다...");
        qnaModel = await qna.load();
        endMessageId = sendTextMessage("QnA 모델 로딩이 완료되었습니다.");
    } catch (error) {
        console.error("모델 로딩 중 오류 발생:", error);
        sendTextMessage("QnA 모델 로딩에 실패했습니다.");
    } finally {
        removeMessage(startMessageId); 
        if (endMessageId !== undefined) {
            setTimeout(() => removeMessage(endMessageId), 3000); 
        }
    }
}



async function startFunction() {
    await loadQnAModel();
    setLastSeen();
    waitAndResponse("intro");
}

function checkPassword() {
    let password = prompt("Please enter the password to access this page:", "");
    if (password === null) {
        document.body.innerHTML = 'Access denied';
    } else if (password === "1234") {
        startFunction();
    } else {
        alert("Incorrect password. Access denied.");
        checkPassword();
    }
}

window.onload = function() {
    checkPassword();
};



async function getAnswer(question) {
    if (!qnaModel) {
        console.log("QnA 모델이 아직 로드되지 않았습니다.");
        return "모델 로딩 중입니다. 잠시 후 다시 시도해주세요.";
    }

    if (question.toLowerCase().includes("what is the date today")) {
        const today = new Date();
        return `오늘 날짜는 ${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일입니다.`;
    }

    try {
        const referenceText = `KISS was founded by CEO John Chang and cofounders Sung Yong Chang and Won Shik Kang in Flushing, Queens in 1989. It began as a small startup offering do-it-yourself nail care products, which was a niche market at the time, and reached the national stage selling 18 of its items in Walgreens stores by 1992. As the company grew, it needed more space. That is when KISS arrived in Port Washington, where it is been operating since 2005. The larger facility was fit to “accommodate the company continuing expansion and growth,” its website states. The beauty brand has only expanded further in the past 16 years since coming to Long Island. Its KISS IVY division moved to its own Port Washington warehouse in 2014. And the entire company got a brand-new, 272,000-square-foot headquarters, also in Port Washington, in 2018. KISS Products, Inc. is a beauty company known primarily for its extensive range of nail care products. Founded in 1989 by South Korean immigrant John Chang, the company began as a small enterprise in Flushing, New York. KISS has since grown into a global brand, recognized for its innovative approach to beauty products, especially in the nail care segment. The company's product line includes artificial nails, nail treatment products, nail glue, nail tools, and nail art, as well as eyelashes and cosmetic products. KISS Products is particularly noted for making professional-quality nail care and enhancement products accessible to consumers at home. This has been a key factor in their success, as they've effectively democratized what was once only available in salons.         KISS emphasizes innovation in its products, often introducing new technologies and trends in the beauty industry. Their approach has always been about empowering consumers to achieve salon-quality results independently, at a fraction of the cost. Their marketing campaigns often feature striking visuals and are known for their inclusivity, reflecting a diverse range of beauty standards and styles. This strategy has helped KISS to connect with a broad audience, appealing to different tastes and preferences in beauty.  In addition to their commercial success, KISS Products is also involved in various community initiatives and charitable activities, reflecting their commitment to social responsibility. This aspect of the company's ethos has helped to build a strong, positive brand image.
        As of my last update in April 2023, KISS Products continues to be a significant player in the beauty industry, constantly evolving and expanding its product range to meet the changing needs and preferences of its global customer base.`;
        const answers = await qnaModel.findAnswers(question, referenceText);

        if (answers.length > 0) {
            const answer = answers[0];
            const answerText = referenceText.substring(answer.startIndex, answer.endIndex + 1);
            return answerText;
        } else {
            return "답변을 찾을 수 없습니다.";
        }
    } catch (error) {
        console.error("답변 처리 중 오류 발생:", error);
        return "답변 처리 중 오류가 발생했습니다.";
    }
}

function setLastSeen() {
    var date = new Date();
    var lastSeen = document.getElementById("lastseen");
    lastSeen.innerText = "last seen today at " + date.getHours() + ":" + date.getMinutes()
}


function closeFullDP() {
    var x = document.getElementById("fullScreenDP");
    if (x.style.display === 'flex') {
        x.style.display = 'none';
    } else {
        x.style.display = 'flex';
    }
}

function openFullScreenDP() {
    var x = document.getElementById("fullScreenDP");
    if (x.style.display === 'flex') {
        x.style.display = 'none';
    } else {
        x.style.display = 'flex';
    }
}


function isEnter(event) {
    if (event.keyCode == 13) {
        sendMsg();
    }
}


async function sendMsg() {
    var input = document.getElementById("inputMSG");
    var ti = input.value;
    if (ti == "") {
        return;
    }

    var date = new Date();
    var myLI = document.createElement("li");
    var myDiv = document.createElement("div");
    var greendiv = document.createElement("div");
    var dateLabel = document.createElement("label");
    dateLabel.innerText = date.getHours() + ":" + date.getMinutes();
    myDiv.setAttribute("class", "sent");
    greendiv.setAttribute("class", "green");
    dateLabel.setAttribute("class", "dateLabel");
    greendiv.innerText = input.value;
    myDiv.appendChild(greendiv);
    myLI.appendChild(myDiv);
    greendiv.appendChild(dateLabel);
    document.getElementById("listUL").appendChild(myLI);
    var s = document.getElementById("chatting");
    s.scrollTop = s.scrollHeight;

    const keywords = ["help", "budget", "skills","address", "contact", "about", "clear"];
    if (keywords.includes(ti)) {
        waitAndResponse(ti);
    } else {
        // 일반 질문에 대한 처리
        try {
            const answer = await getAnswer(ti);
            setTimeout(function () { sendTextMessage(answer) }, 1500);
        } catch (error) {
            console.error("답변 처리 중 오류 발생: ", error);
            sendTextMessage("죄송합니다. 오류가 발생했습니다.");
        }
    }

    input.value = "";
    playSound();
}



async function waitAndResponse(inputText) {
    var lastSeen = document.getElementById("lastseen");
    lastSeen.innerText = "typing...";
    switch (inputText.toLowerCase().trim()) {
        case "intro":
            setTimeout(() => {
                sendTextMessage("Warm greetings! 👋🏻<br><br> My name is <span class='bold'><a class='alink'>SOM A.I.</a></span>.<br><br> I am a friendly chatbot, always ready to assist you. <br><br> I'm eager to hear about your questions and would be delighted to chat with you. <br><br> Please send <span class='bold'>'help'</span> if you need any assistance or have queries.<br><br> Let's embark on a wonderful conversation together!");
            }, 2000);
            return;
        case "help":
            sendTextMessage("<span class='sk'>Please provide the specific keyword or topic you'd like to talk about<br>e.g<br><span class='bold'>'budget'</span> - Budget Instruction Manual <br><span class='bold'>'address'</span> - to get my address<br><span class='bold'>'contact'</span> - to get ways to connect with me<br><span class='bold'>'clear'</span> - to clear conversation<br><span class='bold'>'about'</span> - to know about this site</span>");
            return;
        case "budget":
            sendTextMessage(budgetString);
            return;
        case "skills":
            sendTextMessage("<span class='sk'>I am currently pursuing B.Tech degree in Computer Science Engineering.<br><br>I can comfortably write code in following languages :<br><span class='bold'>Java<br>C++<br>C<br>PHP<br>Kotlin<br>Dart<br>Python<br>CSS<br>HTML</span><br><br>I've experiance with following frameworks :<span class='bold'><br>Android<br>Flutter<br>ReactJs<br>GTK</span><br><br>I use <span class='bold'>Arch Linux</span> as daily driver on my HP Pavilion 15-ec0xxx<br>OS:Arch Linux<br>DE:Gnome(More often) Kde(often)<br>Favourite IDE:VSCode</span>");
            return;

        //case "education":
        //    sendTextMessage("I am currently pusuing B.Tech degree in Computer Science Engineering from TKIET Kolhapur<br>Passing Year : 2023<br><br>I have completed my Diploma from Government Polytechnic Karad<br>Passing Year:2020<br>Result:86.06%<br><br>I have completed my Secondary school from local school known as SWV<br>Passing Year:2016");
        //    return;

        case "address":
            sendTextMessage(addressString);
            return;
        case "clear":
            clearChat();
            return;
        case "about":
            sendTextMessage("SOM AI 입니다<br><br> Designed and Developed by Hahyung</span>");
            return;
        case "contact":
            sendTextMessage(contactString);
            return;
        //case "projects":
        //    sendTextMessage("You want to check my projects? Then just jump into my Github Account.<br><br><div class='social'><a target='_blank' href='https://github.com/Vinayak-09'> <div class='socialItem'><img class='socialItemI' src='images/github.svg' alt=''></div> </a></div>");
        //    return;
        //case "new":
        //    sendTextMessage(addressString);
        //    return;
        default:
            try {
                const answer = await getAnswer(inputText);
                sendTextMessage(answer);
            } catch (error) {
                console.error("답변 처리 중 오류 발생: ", error);
                sendTextMessage("죄송합니다. 오류가 발생했습니다.");
            }
            break;
    }



}


function clearChat() {
    document.getElementById("listUL").innerHTML = "";
    waitAndResponse('intro');  
}


function sendTextMessage(textToSend) {
    var messageId = ++messageId; // 새 메시지 ID 생성
    setTimeout(setLastSeen, 1000);
    var date = new Date();
    var myLI = document.createElement("li");
    myLI.id = 'message-' + messageId; // 메시지에 ID 부여
    var myDiv = document.createElement("div");
    var greendiv = document.createElement("div");
    var dateLabel = document.createElement("label");
    dateLabel.setAttribute("id", "sentlabel");
    dateLabel.id = "sentlabel";
    dateLabel.innerText = date.getHours() + ":" + date.getMinutes();
    myDiv.setAttribute("class", "received");
    greendiv.setAttribute("class", "grey");
    greendiv.innerHTML = textToSend;
    myDiv.appendChild(greendiv);
    myLI.appendChild(myDiv);
    greendiv.appendChild(dateLabel);
    document.getElementById("listUL").appendChild(myLI);
    var s = document.getElementById("chatting");
    s.scrollTop = s.scrollHeight;
    playSound();

    return messageId; // 생성된 메시지 ID 반환
}


function sendResponse() {
    setTimeout(setLastSeen, 1000);
    var date = new Date();
    var myLI = document.createElement("li");
    var myDiv = document.createElement("div");
    var greendiv = document.createElement("div");
    var dateLabel = document.createElement("label");
    dateLabel.innerText = date.getHours() + ":" + date.getMinutes();
    myDiv.setAttribute("class", "received");
    greendiv.setAttribute("class", "grey");
    dateLabel.setAttribute("class", "dateLabel");
    greendiv.innerText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. ";
    myDiv.appendChild(greendiv);
    myLI.appendChild(myDiv);
    greendiv.appendChild(dateLabel);
    document.getElementById("listUL").appendChild(myLI);
    var s = document.getElementById("chatting");
    s.scrollTop = s.scrollHeight;
    playSound();
}

function playSound() {
    audio.play();
}

window.onload = function() {
    checkPassword();
};
