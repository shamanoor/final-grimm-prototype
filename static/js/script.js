console.log("heyyyy ;)");


$(document).ready(function() {
    $("#conditional-button").click(function(event) {
        console.log("before ajax")
        $.ajax({
            type: "POST",
            contentType: "application/json;charset=utf-8",
            url: "/predict",
            traditional: "true",
            data: JSON.stringify({"unconditional" : "True"}),
            dataType: "json"
        });
    });


    $("#predict-button").click(function(event) {
        console.log("je hebt geklikt schat");
        $.post("http://127.0.0.1:5000/sample_model", function(response) {
        $("#prd1-prediction").text(response.text);
        $("#prd2-prediction").text(response.keywords1) ;
        $("#prd3-prediction").text(response.keywords2) ;
        $("#prd4-prediction").text(response.image);
        console.log(response);
        });
    });
});

$(document).ready(function() {
    $("#complete-button").click(function(event) {
        console.log("je hebt geklikt op complete button schat");
        prompt = document.getElementById("prompt").value;
        console.log(prompt)
        response = $.ajax({
            type: "POST",
            contentType: "application/json;charset=utf-8",
            url: "/interact_model",
            traditional: "true",
            data: JSON.stringify({"unconditional" : prompt}),
            dataType: "json",
            complete: function(response) {
                WriteData(prompt, response);
            }
        });


    });
});

$(document).ready(function() {
    $("#append").click(function () {
        var MyDiv1 = document.getElementById('prd1-prediction');
        generated = MyDiv1.innerHTML;
        console.log("hi houi hi", generated);
        if($('#container').is(':empty')){
            $("#container").append(generated);
        } else {
            $("#container").append('<br/><br/>' + generated);
        }
    });
});

$(document).ready(function() {
    $("#append2").click(function () {
        var MyDiv1 = document.getElementById('prd1.1-prediction');
        generated = MyDiv1.innerHTML;
        console.log("hi houi hi", generated);
        if($('#container').is(':empty')){
            $("#container").append(generated);
        } else {
            $("#container").append('<br/><br/>' + generated);
        }
    });
});

$(document).ready(function() {
    $("#append-img").click(function () {
        var MyDiv1 = document.getElementById('prd1.1-prediction');
        generated = MyDiv1.innerHTML;
        console.log("hi append-img hi", generated);
        if($('#container').is(':empty')){
            $("#container").append(generated);
        } else {
            $("#container").append('<br/><br/>' + generated);
        }
    });
});

$(document).ready(function() {
    $("#append2-img").click(function () {
        var MyDiv1 = document.getElementById('tti');
        img = MyDiv1.innerHTML;
        console.log("hi append2-img hi", img);
        $("#container").append(img);
    });
});

$(document).ready(function() {
    $('#export').click(function() {
      if ('Blob' in window) {
        var fileName = 'story.txt';
        if (fileName) {
          var textToWrite = $('#container').html();
          console.log(textToWrite)
          var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });

          if ('msSaveOrOpenBlob' in navigator) {
            navigator.msSaveOrOpenBlob(textFileAsBlob, fileName);
          } else {
            var downloadLink = document.createElement('a');
            downloadLink.download = fileName;
            downloadLink.innerHTML = 'Download File';

            if ('webkitURL' in window) {
              // Chrome allows the link to be clicked without actually adding it to the DOM.
              downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
            } else {
              // Firefox requires the link to be added to the DOM before it can be clicked.
              downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
              downloadLink.click(function(){
                document.body.removeChild(event.target);
              });

              downloadLink.style.display = 'none';
              document.body.appendChild(downloadLink);
            }
            downloadLink.click();
          }
        }
      } else {
        alert('Your browser does not support the HTML5 Blob.');
      }
});
});

$(document).ready(function() {
    $('#exportpdf').click(function() {
        console.log("yooo exportpdf let's gooo")
        // use ajax?
        // step 1. call generate_novel.py
        // step 2. return generated pdf

        // store content of container
        prompt = $('#container').html();
        console.log(prompt)

        // HERE PUT PROMT AS ARGUMENT AND CALL FUNCTION main()
        $.ajax({
            type: "POST",
            contentType: "application/json;charset=utf-8",
            url: "/pdf",
            traditional: "true",
            data: JSON.stringify(prompt),
            dataType: "json",
            complete: function(response) {
                  const a = document.createElement("a");
                  a.style.display = "none";
                  document.body.appendChild(a);

                  // Set the HREF to a Blob representation of the data to be downloaded
                  a.href = window.URL.createObjectURL(
                    new Blob([response.responseText], { "type": "application/pdf" })
                  );

                  // Use download attribute to set set desired file name
                  a.setAttribute("download", "Story_" + new Date() + ".pdf");

                  // Trigger the download by simulating click
                  a.click();

                  // Cleanup
                  window.URL.revokeObjectURL(a.href);
                  document.body.removeChild(a);
            }
        });
    });
});


function WriteData(prompt, response) {
    console.log(response);
    document.getElementById("prd1.1-prediction").textContent = prompt + response.responseJSON.text;
//    document.getElementById("prd2.1-prediction").textContent = response.responseJSON.keywords1;
//    document.getElementById("prd3.1-prediction").textContent = response.responseJSON.keywords2;
}

function SearchPhotos() {
  let clientId = '5e7c144c53351e29b80b68abe9d4f59f0710095251baed6a6b27995de4762a5a';
  let query = document.getElementById("search_unsplash").value;
  let url = "https://api.unsplash.com/search/photos?client_id=" + clientId + "&query=" + query;

  // make a request to the API
  fetch(url)
    .then(function (data) {
        return data.json();
    })
    .then(function (data) {
        console.log(data);

        $("#result").empty()

        data.results.forEach(photo => {
            let result = `
                <img src="${photo.urls.regular}">
                <a href="${photo.links.download}">
            `;

            $("#result").append(result);
        })
    })
}

function GetPhoto() {
    console.log('hi');
    $("#tti").empty();

    let query = document.getElementById("search_tti").value;

    deepai.setApiKey('9ceb784c-0739-41d9-93a2-f3a9d19af543');

    (async function() {
        var resp = await deepai.callStandardApi("text2img", {
                text: query,
        });
        console.log(resp);
        src = resp.output_url;
        img = document.createElement('img');

        img.src = src;
        document.getElementById("tti").appendChild(img);
    })()
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

/* Below for collapsible */
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}