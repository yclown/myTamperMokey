// ==UserScript==
// @name         必应积分机器人
// @namespace    http://tampermonkey.net/
// @version      2025-05-21
// @description  使用方法 游览器打开https://cn.bing.com/rewards/panelflyout页面，挂机就行
// @author       You
// @match        https://cn.bing.com/rewards/panelflyout
// @match        https://cn.bing.com/search?q=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

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
      //以获得积分
      var getSore=Number(document.getElementById("page_content").textContent.match(/你已获得 (\d+) 积分/)[1]) ;
      //最大可获得积分
      var maxSore= Number(document.getElementById("page_content").textContent.match(/每天继续搜索并获得最多 (\d+) 奖励积分/)[1]);
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

    function CheckFinish(){
      var info= GetToDayRewordInfo();
      var search_finish=info.getSore>=info.maxSore;
        
      if(search_finish){
        SaveFinish(true);
        return true;

      }
      return false;
    }
    function sleep(time){
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    //获取可执行的任务，准备点击
    function GetTask(){ 

      return [];
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
            // console.log("不在可执行时间内");
            return;
        }

       if(CheckFinish()){
          // console.log("今日已完成");
          return;
       }

       var info= GetFinish();
       if(!info.search_finish){ 
          SendMsg("search");
       }
 
    }

    function canRun(){
      return new Date().getHours()>=8

    }
    // var search_win= window.open('https://cn.bing.com/search?q='+randomlyGeneratedChineseCharacters(parseInt(Math.random()*(5-2+1)+2)));
    
    var channel= new BroadcastChannel('myChannel');
    function Init(){
       
       if(window.location.href.indexOf("rewards/panelflyout") > -1){
            run();
            //30秒执行一次
            setInterval(() => {

                 
                run() 
            }, 1000*30);

       }else{
          
           ListenMsg()
       }
      
    }
    Init()
    
    
})();