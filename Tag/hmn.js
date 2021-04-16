function loadScript(url, callback)
{
    // adding the script tag to the head as suggested before
   var head = document.getElementsByTagName('head')[0];
   var script = document.createElement('script');
   script.type = 'text/javascript';
   script.async = true;
   script.src = url;

   // then bind the event to the callback function 
   // there are several events for cross browser compatibility
   script.onreadystatechange = callback;
   script.onload = callback;

   // fire the loading
   head.appendChild(script);
}


var configure_ads = function() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Z4Q73Q10KF');
}

var configure_analytics = function() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Z4Q73Q10KF');
}


loadScript("https://www.googletagmanager.com/gtag/js?id=AW-617519608", configure_ads);
loadScript("https://www.googletagmanager.com/gtag/js?id=G-Z4Q73Q10KF", configure_analytics);