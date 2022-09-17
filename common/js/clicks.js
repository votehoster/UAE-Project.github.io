$(function(){
	$('._click_record').click(function(){
		var website_id = $(this).data('websiteid');
		var type = $(this).data('type');

		$.ajax({
            method:"post",
            url:"/stats/click/store",
            data:{ 
            	_token : window.Laravel.csrfToken,
                website_id : website_id,
                type : type
            },
            success:function(response){
            },
            error:function(response){
            }
        });
	});
});

$(document).ready(function() {
    
    var url = "https://d1e23c6kqp4wis.cloudfront.net/decodevisitordetails";
    
    //var url = "https://vefz3161f4.execute-api.ap-south-1.amazonaws.com/live/decodevisitordetails";
    // console.log(url);
    var settings = {
          "url": url,
          "method": "POST",
          "timeout": 0,
          "headers": {
              "Content-Type": "application/json"
          },
          "data": JSON.stringify({}),
      };
      
      $.ajax(settings).done(function (response) {
          //console.log(response);
          //alert("userCityName - " + response.userCityName + " / userCountry - "+ response.userCountry + " / userCountryName - "+ response.userCountryName);
        var cityName = response.userCityName;
        var userCountry = response.userCountry;
        var userCountryName = response.userCountryName;
        var website_id = $('.__website_id').val();
        var businessdetails_id = $('#businessdetails_id').val();
        //alert("website_id: "+website_id +" / bizid: " + businessdetails_id );
        
        //alert(document.referrer.split("?").slice(1).join("?"));
        //alert(document.referrer.substring(document.referrer.indexOf("?") + 1));
        //alert(/(?:\?(.+))?/.exec(document.referrer)[1]);
        //alert(window.location.search);
        
        /* 0. Pre-requisites */
        var referrer = document.referrer;
        var url = window.location.href;
        var source = 'direct';
        
        /* 1. Calculating Source */
        if(referrer.includes("plus") && referrer.includes("google")){
            source = "g+";
        }else if(!referrer.includes("plus") && referrer.includes("google")){
            source = "google";
        }else{
            var source_list = ["g+", "facebook", "linked", "twitter", "instagram",
                "google", "bing", "yahoo", "duckduckgo", "baidu", "ask", "aol", "wolframalpha", "yandex", "webcrawler",
                "search", "dogpile", "ixquick", "excite", "info", "websites", "unknown", "other"];
            for(var search_str in source_list){
                if( referrer.includes(search_str)){
                    ////alert(search_str);
                    source = search_str;
                    break;
                }
            }
        }
        
        //alert("Source is = "+source);
        //alert("Referrer is : "+document.referrer + " FUll URL = " + window.location.href +" / Q = "+window.location.search+"Source is = "+source);

        // console.log("Referrer is : " + document.referrer);
        var extended_params = "?website_id = "+website_id+
                                "&businessdetails_id = " + businessdetails_id +
                                "&city = "+cityName+
                                "&country = "+userCountryName+
                                "&country_code = "+userCountry ;
        var url2 = "https://vefz3161f4.execute-api.ap-south-1.amazonaws.com/live/processhitrequest"+extended_params;
        var settings2 = {
              "url": url2,
              "method": "POST",
              "timeout": 0,
              "headers": {
                  "Content-Type": "application/json"
              },
              "data": JSON.stringify({}),
          };
          
          $.ajax(settings2).done(function (response2) {
              //alert("Response stage 2 received");
            //   console.log("Response stage 2 received");
            //   console.log(response);
              //alert("userCityName - " + response.userCityName + " / userCountry - "+ response.userCountry + " / userCountryName - "+ response.userCountryName);
              
              
          }).fail(function (response2) {
              ////alert(JSON.stringify(response2));
          });
          
      }).fail(function (response) {
          ////alert(JSON.stringify(response));
      });
});