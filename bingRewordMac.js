// ==UserScript==
// @name         必应积分机器人
// @namespace    http://tampermonkey.net/
// @version      2025-05-21
// @description  使用方法 游览器打开https://cn.bing.com/rewards/panelflyout页面，挂机就行
// @author       You
// @match        https://cn.bing.com/rewards/panelflyout*
// @match        https://cn.bing.com/spotlight/imagepuzzle*
// @match        https://cn.bing.com/search*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    //搜索间隔 默认60s
    var timer=60;
     //日期格式化
    Date.prototype.Format = function (fmt) {
        var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
     //随机中文字符
    function randomlyGeneratedChineseCharacters(num) {
        let arr = []
        for (let i = 0; i < num; i++) {
            let str
            //汉字对应的unicode编码为u4e00-u9fa5转为10进制为19968-40869，先取随机数，再转为16进制
            str = '\\u' + (Math.floor(Math.random() * (40869 - 19968)) + 19968).toString(16)
            //在用正则操作数据后进行解码。注意：unescape() 函数在 JavaScript 1.5 版中已弃用。请使用 decodeURI() 或 decodeURIComponent() 代替。
            str = unescape(str.replace(/\\u/g, "%u"));
            arr.push(str)
        }
        let chinese = arr.join("")
        return chinese
    }

    function Search(){ 
      document.getElementById("sb_form_q").value=randomlyGeneratedChineseCharacters(parseInt(Math.random()*(5-2+1)+2));
      document.getElementById("sb_form_go").click(); 
    }
    // 获取当天的积分信息
    function GetToDayRewordInfo(){
      // //以获得积分
      // var getSore=Number(document.getElementById("page_content").textContent.match(/你已获得 (\d+) 积分/)[1]) ;
      // //最大可获得积分
      // var maxSore= Number(document.getElementById("page_content").textContent.match(/每天继续搜索并获得最多 (\d+) 奖励积分/)[1]);
      if(document.getElementsByClassName("daily_search_row").length==0){
        console.log("没有搜索积分信息");
        return {
          getSore: 0,
          maxSore: 0
        }
      }
      var getSore=Number( document.getElementsByClassName("daily_search_row")[0].textContent.match(/每日搜索(\d+)\/(\d+)/)[1]);
      var maxSore=Number(document.getElementsByClassName("daily_search_row")[0].textContent.match(/每日搜索(\d+)\/(\d+)/)[2]); 
      return {
        getSore: getSore,
        maxSore: maxSore
      }
    }
    
    function SaveFinish(isFinish){ 
      var date = new Date();
      var dateStr = date.Format("yyyy-MM-dd");
      var data = {
        date: dateStr, 
        isFinish: isFinish
      };
      GM_setValue("rewordInfo", JSON.stringify(data));
      return data;
    }
    function GetFinish(){ 
      var data=GM_getValue("rewordInfo");
      if(data==undefined){
        return SaveFinish(false); 
      }else{
        data=JSON.parse(data);
        if(data.date!=new Date().Format("yyyy-MM-dd")){
          return SaveFinish(false); 
        }else{
          return data;
        }
      } 
      
    }
    
    function IsSearchFinish(){
      var info= GetToDayRewordInfo();
      console.log("获取到的积分信息",info);
      return info.getSore>=info.maxSore;
        
      
      
    }

    //获取可执行的任务，准备点击
    function doTask(){ 
      var tasks=getTask();
      if(tasks.length==0){
        console.log("没有可执行的任务");
        return false;
      }
      tasks[0].click();
      // for(var i=0;i<tasks.length;i++){
      //   var task=tasks[i];
      //   task.click(); 
      // }
      return true;
    }

    function getTask(){
      var tasks= document.getElementsByClassName("rw-si add")
      var taskList=[];
      for(var i=0;i<tasks.length;i++){
        var task=tasks[i].closest("a");
        if(task.href.indexOf("form=rwfobc") > -1){

          continue;
        }

        if(task.previousSibling==null||task.previousSibling.className == "unlocked_tooltip"){
          taskList.push(task);
        }
      }

      return taskList;
    }
    function hasTask(){
       var task=getTask();
       return task.length>0;
    }

    // var searchWindow = null;
    function doSearch(){ 
      //  var search_key= randomlyGeneratedChineseCharacters(parseInt(Math.random()*(5-2+1)+2))
      var searchWindow= window.open('https://cn.bing.com/search?q=%E5%BE%AE%E8%BD%AF%E7%A7%AF%E5%88%86&qs=n&form=QBRE&sp=-1&lq=0&pq=%E5%BE%AE%E8%BD%AFji%27fen&sc=12-8&sk=&cvid=4038A0AD7F734C0C83FD61119FD6F67A','searchWindow');


     setTimeout(() => {
          searchWindow.document.getElementById("sb_form_q").value=randomlyGeneratedChineseCharacters(parseInt(Math.random()*(5-2+1)+2));
       
          searchWindow.document.getElementById("sb_form_go").click(); 

          setTimeout(() => {
            searchWindow.close();
            // SendMsg("search");
          }, 5*1000);

      }, 3*1000); 
      

    }
    function SendMsg(msg){
      
      channel.postMessage(msg);
    }
    function ListenMsg(){
      channel.onmessage = function(event) {
        switch (event.data) {
          case "search":
            console.log("触发搜索");
            Search();
            break;
         
          default:
            console.log("未知消息");
        }
         
      };
      console.log("监听消息中...");
    }
    
    function run(){
        if(!canRun()){
          console.log("当前时间不允许运行");
          return false;
        } 

        if(doTask()){
          return  true;
        }

       var info= GetFinish();
       if(!IsSearchFinish()){ 
          doSearch()
          // SendMsg("search");
          return true;
       }
       return false;
    }

    function closeTaskWindows(){
       try {
        window.opener = window;
        var win = window.open("","_self");
        win.close();
        //frame的时候
        top.close();
      } catch (e) {
  
      }
    }

    function canRun(){
      return new Date().getHours()>=7

    }
    var channel= new BroadcastChannel('myChannel');
    var noRun=0;
    var max_noRun=60;

    function Init(){
       
       if(window.location.href.indexOf("RewardsDO") > -1||window.location.href.indexOf("imagepuzzle") > -1){
          //关闭任务页面
          setTimeout(() => {
            closeTaskWindows() ;
          }, 1000);
          
       }else  if(window.location.href.indexOf("rewards/panelflyout") > -1){
            if(window.frameElement && window.frameElement.tagName === 'IFRAME'){
              return;
            }

            run();
            
            setInterval(() => {
              var isrun= run();
              if(!isrun){
                 noRun++;
                 if(noRun>=max_noRun){
                    console.log("连续X次没有可执行任务，刷新页面");
                    window.location.reload();
                 }
                 console.log("没有可执行任务，循环");
              }

            }, 1000*timer);

            // setTimeout(() => {
               
            //    setTimeout(() => {
            //         window.location.reload();
            //     }, 1000*timer)
             
            // },2000);
       }else{
          
            // ListenMsg()
       }

       
      
    }
    Init()
    
    
})();