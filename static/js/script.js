console.log("heyyyy ;)");

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
    $("#append2").click(function () {
        var MyDiv1 = document.getElementById('prd1.1-prediction');
        generated = MyDiv1.innerHTML;
        $("#container").append(generated);
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

// export to txt
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

// export to pdf
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
    document.getElementById("prd1.1-prediction").textContent = prompt + JSON.parse(response.responseText).text;
}


function GeneratePhoto() {
    console.log("try to get locally generated image into html");
    $("#tti").empty();
    keyword = document.getElementById("search_tti").value;
    console.log(keyword)
    response = $.ajax({
        type: "POST",
        contentType: "application/json;charset=utf-8",
        url: "/generate_image",
        traditional: "true",
        data: JSON.stringify({"keyword" : keyword}),
        dataType: "json",
        complete: function(response) {
            if (response.status == 200) {
                console.log(response)
                src = response.responseText;
                var prefix = 'data:image/jpeg;base64,'
                var encoded = prefix + src

                img = document.createElement('img');

                img.src = encoded;
                document.getElementById("tti").appendChild(img);
            }
            else {
                msg = document.createTextNode("That's an invalid keyword :(");
                document.getElementById("tti").appendChild(msg);
            }
        }
    });
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

var availableTags = [' tench', ' goldfish', ' great white shark', ' tiger shark', ' hammerhead', ' electric ray', ' stingray', ' cock', ' hen', ' ostrich', ' brambling', ' goldfinch', ' house finch', ' junco', ' indigo bunting', ' robin', ' bulbul', ' jay', ' magpie', ' chickadee', ' water ouzel', ' kite', ' bald eagle', ' vulture', ' great grey owl', ' European fire salamander', ' common newt', ' eft', ' spotted salamander', ' axolotl', ' bullfrog', ' tree frog', ' tailed frog', ' loggerhead', ' leatherback turtle', ' mud turtle', ' terrapin', ' box turtle', ' banded gecko', ' common iguana', ' American chameleon', ' whiptail', ' agama', ' frilled lizard', ' alligator lizard', ' Gila monster', ' green lizard', ' African chameleon', ' Komodo dragon', ' African crocodile', ' American alligator', ' triceratops', ' thunder snake', ' ringneck snake', ' hognose snake', ' green snake', ' king snake', ' garter snake', ' water snake', ' vine snake', ' night snake', ' boa constrictor', ' rock python', ' Indian cobra', ' green mamba', ' sea snake', ' horned viper', ' diamondback', ' sidewinder', ' trilobite', ' harvestman', ' scorpion', ' black and gold garden spider', ' barn spider', ' garden spider', ' black widow', ' tarantula', ' wolf spider', ' tick', ' centipede', ' black grouse', ' ptarmigan', ' ruffed grouse', ' prairie chicken', ' peacock', ' quail', ' partridge', ' African grey', ' macaw', ' sulphur-crested cockatoo', ' lorikeet', ' coucal', ' bee eater', ' hornbill', ' hummingbird', ' jacamar', ' toucan', ' drake', ' red-breasted merganser', ' goose', ' black swan', ' tusker', ' echidna', ' platypus', ' wallaby', ' koala', ' wombat', ' jellyfish', ' sea anemone', ' brain coral', ' flatworm', ' nematode', ' conch', ' snail', ' slug', ' sea slug', ' chiton', ' chambered nautilus', ' Dungeness crab', ' rock crab', ' fiddler crab', ' king crab', ' American lobster', ' spiny lobster', ' crayfish', ' hermit crab', ' isopod', ' white stork', ' black stork', ' spoonbill', ' flamingo', ' little blue heron', ' American egret', ' bittern', ' crane', ' limpkin', ' European gallinule', ' American coot', ' bustard', ' ruddy turnstone', ' red-backed sandpiper', ' redshank', ' dowitcher', ' oystercatcher', ' pelican', ' king penguin', ' albatross', ' grey whale', ' killer whale', ' dugong', ' sea lion', ' Chihuahua', ' Japanese spaniel', ' Maltese dog', ' Pekinese', ' Shih-Tzu', ' Blenheim spaniel', ' papillon', ' toy terrier', ' Rhodesian ridgeback', ' Afghan hound', ' basset', ' beagle', ' bloodhound', ' bluetick', ' black-and-tan coonhound', ' Walker hound', ' English foxhound', ' redbone', ' borzoi', ' Irish wolfhound', ' Italian greyhound', ' whippet', ' Ibizan hound', ' Norwegian elkhound', ' otterhound', ' Saluki', ' Scottish deerhound', ' Weimaraner', ' Staffordshire bullterrier', ' American Staffordshire terrier', ' Bedlington terrier', ' Border terrier', ' Kerry blue terrier', ' Irish terrier', ' Norfolk terrier', ' Norwich terrier', ' Yorkshire terrier', ' wire-haired fox terrier', ' Lakeland terrier', ' Sealyham terrier', ' Airedale', ' cairn', ' Australian terrier', ' Dandie Dinmont', ' Boston bull', ' miniature schnauzer', ' giant schnauzer', ' standard schnauzer', ' Scotch terrier', ' Tibetan terrier', ' silky terrier', ' soft-coated wheaten terrier', ' West Highland white terrier', ' Lhasa', ' flat-coated retriever', ' curly-coated retriever', ' golden retriever', ' Labrador retriever', ' Chesapeake Bay retriever', ' German short-haired pointer', ' vizsla', ' English setter', ' Irish setter', ' Gordon setter', ' Brittany spaniel', ' clumber', ' English springer', ' Welsh springer spaniel', ' cocker spaniel', ' Sussex spaniel', ' Irish water spaniel', ' kuvasz', ' schipperke', ' groenendael', ' malinois', ' briard', ' kelpie', ' komondor', ' Old English sheepdog', ' Shetland sheepdog', ' collie', ' Border collie', ' Bouvier des Flandres', ' Rottweiler', ' German shepherd', ' Doberman', ' miniature pinscher', ' Greater Swiss Mountain dog', ' Bernese mountain dog', ' Appenzeller', ' EntleBucher', ' boxer', ' bull mastiff', ' Tibetan mastiff', ' French bulldog', ' Great Dane', ' Saint Bernard', ' Eskimo dog', ' malamute', ' Siberian husky', ' dalmatian', ' affenpinscher', ' basenji', ' pug', ' Leonberg', ' Newfoundland', ' Great Pyrenees', ' Samoyed', ' Pomeranian', ' chow', ' keeshond', ' Brabancon griffon', ' Pembroke', ' Cardigan', ' toy poodle', ' miniature poodle', ' standard poodle', ' Mexican hairless', ' timber wolf', ' white wolf', ' red wolf', ' coyote', ' dingo', ' dhole', ' African hunting dog', ' hyena', ' red fox', ' kit fox', ' Arctic fox', ' grey fox', ' tabby', ' tiger cat', ' Persian cat', ' Siamese cat', ' Egyptian cat', ' cougar', ' lynx', ' leopard', ' snow leopard', ' jaguar', ' lion', ' tiger', ' cheetah', ' brown bear', ' American black bear', ' ice bear', ' sloth bear', ' mongoose', ' meerkat', ' tiger beetle', ' ladybug', ' ground beetle', ' long-horned beetle', ' leaf beetle', ' dung beetle', ' rhinoceros beetle', ' weevil', ' fly', ' bee', ' ant', ' grasshopper', ' cricket', ' walking stick', ' cockroach', ' mantis', ' cicada', ' leafhopper', ' lacewing', ' dragonfly', ' damselfly', ' admiral', ' ringlet', ' monarch', ' cabbage butterfly', ' sulphur butterfly', ' lycaenid', ' starfish', ' sea urchin', ' sea cucumber', ' wood rabbit', ' hare', ' Angora', ' hamster', ' porcupine', ' fox squirrel', ' marmot', ' beaver', ' guinea pig', ' sorrel', ' zebra', ' hog', ' wild boar', ' warthog', ' hippopotamus', ' ox', ' water buffalo', ' bison', ' ram', ' bighorn', ' ibex', ' hartebeest', ' impala', ' gazelle', ' Arabian camel', ' llama', ' weasel', ' mink', ' polecat', ' black-footed ferret', ' otter', ' skunk', ' badger', ' armadillo', ' three-toed sloth', ' orangutan', ' gorilla', ' chimpanzee', ' gibbon', ' siamang', ' guenon', ' patas', ' baboon', ' macaque', ' langur', ' colobus', ' proboscis monkey', ' marmoset', ' capuchin', ' howler monkey', ' titi', ' spider monkey', ' squirrel monkey', ' Madagascar cat', ' indri', ' Indian elephant', ' African elephant', ' lesser panda', ' giant panda', ' barracouta', ' eel', ' coho', ' rock beauty', ' anemone fish', ' sturgeon', ' gar', ' lionfish', ' puffer', ' abacus', ' abaya', ' academic gown', ' accordion', ' acoustic guitar', ' aircraft carrier', ' airliner', ' airship', ' altar', ' ambulance', ' amphibian', ' analog clock', ' apiary', ' apron', ' ashcan', ' assault rifle', ' backpack', ' bakery', ' balance beam', ' balloon', ' ballpoint', ' Band Aid', ' banjo', ' bannister', ' barbell', ' barber chair', ' barbershop', ' barn', ' barometer', ' barrel', ' barrow', ' baseball', ' basketball', ' bassinet', ' bassoon', ' bathing cap', ' bath towel', ' bathtub', ' beach wagon', ' beacon', ' beaker', ' bearskin', ' beer bottle', ' beer glass', ' bell cote', ' bib', ' bicycle-built-for-two', ' bikini', ' binder', ' binoculars', ' birdhouse', ' boathouse', ' bobsled', ' bolo tie', ' bonnet', ' bookcase', ' bookshop', ' bottlecap', ' bow', ' bow tie', ' brass', ' brassiere', ' breakwater', ' breastplate', ' broom', ' bucket', ' buckle', ' bulletproof vest', ' bullet train', ' butcher shop', ' cab', ' caldron', ' candle', ' cannon', ' canoe', ' can opener', ' cardigan', ' car mirror', ' carousel', " carpenter's kit", ' carton', ' car wheel', ' cash machine', ' cassette', ' cassette player', ' castle', ' catamaran', ' CD player', ' cello', ' cellular telephone', ' chain', ' chainlink fence', ' chain mail', ' chain saw', ' chest', ' chiffonier', ' chime', ' china cabinet', ' Christmas stocking', ' church', ' cinema', ' cleaver', ' cliff dwelling', ' cloak', ' clog', ' cocktail shaker', ' coffee mug', ' coffeepot', ' coil', ' combination lock', ' computer keyboard', ' confectionery', ' container ship', ' convertible', ' corkscrew', ' cornet', ' cowboy boot', ' cowboy hat', ' cradle', ' crane', ' crash helmet', ' crate', ' crib', ' Crock Pot', ' croquet ball', ' crutch', ' cuirass', ' dam', ' desk', ' desktop computer', ' dial telephone', ' diaper', ' digital clock', ' digital watch', ' dining table', ' dishrag', ' dishwasher', ' disk brake', ' dock', ' dogsled', ' dome', ' doormat', ' drilling platform', ' drum', ' drumstick', ' dumbbell', ' Dutch oven', ' electric fan', ' electric guitar', ' electric locomotive', ' entertainment center', ' envelope', ' espresso maker', ' face powder', ' feather boa', ' file', ' fireboat', ' fire engine', ' fire screen', ' flagpole', ' flute', ' folding chair', ' football helmet', ' forklift', ' fountain', ' fountain pen', ' four-poster', ' freight car', ' French horn', ' frying pan', ' fur coat', ' garbage truck', ' gasmask', ' gas pump', ' goblet', ' go-kart', ' golf ball', ' golfcart', ' gondola', ' gong', ' gown', ' grand piano', ' greenhouse', ' grille', ' grocery store', ' guillotine', ' hair slide', ' hair spray', ' half track', ' hammer', ' hamper', ' hand blower', ' hand-held computer', ' handkerchief', ' hard disc', ' harmonica', ' harp', ' harvester', ' hatchet', ' holster', ' home theater', ' honeycomb', ' hook', ' hoopskirt', ' horizontal bar', ' horse cart', ' hourglass', ' iPod', ' iron', " jack-o'-lantern", ' jean', ' jeep', ' jersey', ' jigsaw puzzle', ' jinrikisha', ' joystick', ' kimono', ' knee pad', ' knot', ' lab coat', ' ladle', ' lampshade', ' laptop', ' lawn mower', ' lens cap', ' letter opener', ' library', ' lifeboat', ' lighter', ' limousine', ' liner', ' lipstick', ' Loafer', ' lotion', ' loudspeaker', ' loupe', ' lumbermill', ' magnetic compass', ' mailbag', ' mailbox', ' maillot', ' maillot', ' manhole cover', ' maraca', ' marimba', ' mask', ' matchstick', ' maypole', ' maze', ' measuring cup', ' medicine chest', ' megalith', ' microphone', ' microwave', ' military uniform', ' milk can', ' minibus', ' miniskirt', ' minivan', ' missile', ' mitten', ' mixing bowl', ' mobile home', ' Model T', ' modem', ' monastery', ' monitor', ' moped', ' mortar', ' mortarboard', ' mosque', ' mosquito net', ' motor scooter', ' mountain bike', ' mountain tent', ' mouse', ' mousetrap', ' moving van', ' muzzle', ' nail', ' neck brace', ' necklace', ' nipple', ' notebook', ' obelisk', ' oboe', ' ocarina', ' odometer', ' oil filter', ' organ', ' oscilloscope', ' overskirt', ' oxcart', ' oxygen mask', ' packet', ' paddle', ' paddlewheel', ' padlock', ' paintbrush', ' pajama', ' palace', ' panpipe', ' paper towel', ' parachute', ' parallel bars', ' park bench', ' parking meter', ' passenger car', ' patio', ' pay-phone', ' pedestal', ' pencil box', ' pencil sharpener', ' perfume', ' Petri dish', ' photocopier', ' pick', ' pickelhaube', ' picket fence', ' pickup', ' pier', ' piggy bank', ' pill bottle', ' pillow', ' ping-pong ball', ' pinwheel', ' pirate', ' pitcher', ' plane', ' planetarium', ' plastic bag', ' plate rack', ' plow', ' plunger', ' Polaroid camera', ' pole', ' police van', ' poncho', ' pool table', ' pop bottle', ' pot', " potter's wheel", ' power drill', ' prayer rug', ' printer', ' prison', ' projectile', ' projector', ' puck', ' punching bag', ' purse', ' quill', ' quilt', ' racer', ' racket', ' radiator', ' radio', ' radio telescope', ' rain barrel', ' recreational vehicle', ' reel', ' reflex camera', ' refrigerator', ' remote control', ' restaurant', ' revolver', ' rifle', ' rocking chair', ' rotisserie', ' rubber eraser', ' rugby ball', ' rule', ' running shoe', ' safe', ' safety pin', ' saltshaker', ' sandal', ' sarong', ' sax', ' scabbard', ' scale', ' school bus', ' schooner', ' scoreboard', ' screen', ' screw', ' screwdriver', ' seat belt', ' sewing machine', ' shield', ' shoe shop', ' shoji', ' shopping basket', ' shopping cart', ' shovel', ' shower cap', ' shower curtain', ' ski', ' ski mask', ' sleeping bag', ' slide rule', ' sliding door', ' slot', ' snorkel', ' snowmobile', ' snowplow', ' soap dispenser', ' soccer ball', ' sock', ' solar dish', ' sombrero', ' soup bowl', ' space bar', ' space heater', ' space shuttle', ' spatula', ' speedboat', ' spider web', ' spindle', ' sports car', ' spotlight', ' stage', ' steam locomotive', ' steel arch bridge', ' steel drum', ' stethoscope', ' stole', ' stone wall', ' stopwatch', ' stove', ' strainer', ' streetcar', ' stretcher', ' studio couch', ' stupa', ' submarine', ' suit', ' sundial', ' sunglass', ' sunglasses', ' sunscreen', ' suspension bridge', ' swab', ' sweatshirt', ' swimming trunks', ' swing', ' switch', ' syringe', ' table lamp', ' tank', ' tape player', ' teapot', ' teddy', ' television', ' tennis ball', ' thatch', ' theater curtain', ' thimble', ' thresher', ' throne', ' tile roof', ' toaster', ' tobacco shop', ' toilet seat', ' torch', ' totem pole', ' tow truck', ' toyshop', ' tractor', ' trailer truck', ' tray', ' trench coat', ' tricycle', ' trimaran', ' tripod', ' triumphal arch', ' trolleybus', ' trombone', ' tub', ' turnstile', ' typewriter keyboard', ' umbrella', ' unicycle', ' upright', ' vacuum', ' vase', ' vault', ' velvet', ' vending machine', ' vestment', ' viaduct', ' violin', ' volleyball', ' waffle iron', ' wall clock', ' wallet', ' wardrobe', ' warplane', ' washbasin', ' washer', ' water bottle', ' water jug', ' water tower', ' whiskey jug', ' whistle', ' wig', ' window screen', ' window shade', ' Windsor tie', ' wine bottle', ' wing', ' wok', ' wooden spoon', ' wool', ' worm fence', ' wreck', ' yawl', ' yurt', ' web site', ' comic book', ' crossword puzzle', ' street sign', ' traffic light', ' book jacket', ' menu', ' plate', ' guacamole', ' consomme', ' hot pot', ' trifle', ' ice cream', ' ice lolly', ' French loaf', ' bagel', ' pretzel', ' cheeseburger', ' hotdog', ' mashed potato', ' head cabbage', ' broccoli', ' cauliflower', ' zucchini', ' spaghetti squash', ' acorn squash', ' butternut squash', ' cucumber', ' artichoke', ' bell pepper', ' cardoon', ' mushroom', ' Granny Smith', ' strawberry', ' orange', ' lemon', ' fig', ' pineapple', ' banana', ' jackfruit', ' custard apple', ' pomegranate', ' hay', ' carbonara', ' chocolate sauce', ' dough', ' meat loaf', ' pizza', ' potpie', ' burrito', ' red wine', ' espresso', ' cup', ' eggnog', ' alp', ' bubble', ' cliff', ' coral reef', ' geyser', ' lakeside', ' promontory', ' sandbar', ' seashore', ' valley', ' volcano', ' ballplayer', ' groom', ' scuba diver', ' rapeseed', ' daisy', " yellow lady's slipper", ' corn', ' acorn', ' hip', ' buckeye', ' coral fungus', ' agaric', ' gyromitra', ' stinkhorn', ' earthstar', ' hen-of-the-woods', ' bolete', ' ear', ' toilet tissue']

$(document).ready(function() {
    $(".selector").autocomplete({
        source: availableTags,
        messages: {
            results: '',
            noResults: ''
    }
    });
});

$('div[contenteditable]').keydown(function(e) {
    // trap the return key being pressed
    if (e.keyCode === 13) {
      // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
      document.execCommand('insertHTML', false);
      // prevent the default behaviour of return key pressed
      return false;
    }
});

// Add images in loop to examples page...
var toAdd = document.createDocumentFragment();
num_tags = len(availableTags);
num_rows = Math.ceil(num_tags/7)

//create row, then fill with 7 images, then continue to next row
// total num rows is ceil(num_tags/7)
// then for each image in the 7-image row, add div with class=col-2
// and in the next row add the name of the img
idx = 0
for(var i=0; i < num_rows; i++){
    for(var j=0; j < 7; j++){
       var imgdiv = document.createElement('div');
       imgdiv.className = 'col-2';
       img = tags[idx]
       img_src = '../img/examples/'
       imgdiv.appendChild(img_src + img);
       toAdd.appendChild(newDiv);
    }
    idx += 1

    document.getElementById('test').appendChild(toAdd);
}


document.appendChild(toAdd);