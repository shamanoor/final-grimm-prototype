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

var availableTags = [' tench', ' goldfish', ' great white shark', ' tiger shark', ' hammerhead', ' electric ray', ' stingray', ' cock', ' hen', ' ostrich', ' brambling', ' goldfinch', ' house finch', ' junco', ' indigo bunting', ' robin', ' bulbul', ' jay', ' magpie', ' chickadee', ' water ouzel', ' kite', ' bald eagle', ' vulture', ' great grey owl', ' European fire salamander', ' common newt', ' eft', ' spotted salamander', ' axolotl', ' bullfrog', ' tree frog', ' tailed frog', ' loggerhead', ' leatherback turtle', ' mud turtle', ' terrapin', ' box turtle', ' banded gecko', ' common iguana', ' American chameleon', ' whiptail', ' agama', ' frilled lizard', ' alligator lizard', ' Gila monster', ' green lizard', ' African chameleon', ' Komodo dragon', ' African crocodile', ' American alligator', ' triceratops', ' thunder snake', ' ringneck snake', ' hognose snake', ' green snake', ' king snake', ' garter snake', ' water snake', ' vine snake', ' night snake', ' boa constrictor', ' rock python', ' Indian cobra', ' green mamba', ' sea snake', ' horned viper', ' diamondback', ' sidewinder', ' trilobite', ' harvestman', ' scorpion', ' black and gold garden spider', ' barn spider', ' garden spider', ' black widow', ' tarantula', ' wolf spider', ' tick', ' centipede', ' black grouse', ' ptarmigan', ' ruffed grouse', ' prairie chicken', ' peacock', ' quail', ' partridge', ' African grey', ' macaw', ' sulphur-crested cockatoo', ' lorikeet', ' coucal', ' bee eater', ' hornbill', ' hummingbird', ' jacamar', ' toucan', ' drake', ' red-breasted merganser', ' goose', ' black swan', ' tusker', ' echidna', ' platypus', ' wallaby', ' koala', ' wombat', ' jellyfish', ' sea anemone', ' brain coral', ' flatworm', ' nematode', ' conch', ' snail', ' slug', ' sea slug', ' chiton', ' chambered nautilus', ' Dungeness crab', ' rock crab', ' fiddler crab', ' king crab', ' American lobster', ' spiny lobster', ' crayfish', ' hermit crab', ' isopod', ' white stork', ' black stork', ' spoonbill', ' flamingo', ' little blue heron', ' American egret', ' bittern', ' crane', ' limpkin', ' European gallinule', ' American coot', ' bustard', ' ruddy turnstone', ' red-backed sandpiper', ' redshank', ' dowitcher', ' oystercatcher', ' pelican', ' king penguin', ' albatross', ' grey whale', ' killer whale', ' dugong', ' sea lion', ' Chihuahua', ' Japanese spaniel', ' Maltese dog', ' Pekinese', ' Shih-Tzu', ' Blenheim spaniel', ' papillon', ' toy terrier', ' Rhodesian ridgeback', ' Afghan hound', ' basset', ' beagle', ' bloodhound', ' bluetick', ' black-and-tan coonhound', ' Walker hound', ' English foxhound', ' redbone', ' borzoi', ' Irish wolfhound', ' Italian greyhound', ' whippet', ' Ibizan hound', ' Norwegian elkhound', ' otterhound', ' Saluki', ' Scottish deerhound', ' Weimaraner', ' Staffordshire bullterrier', ' American Staffordshire terrier', ' Bedlington terrier', ' Border terrier', ' Kerry blue terrier', ' Irish terrier', ' Norfolk terrier', ' Norwich terrier', ' Yorkshire terrier', ' wire-haired fox terrier', ' Lakeland terrier', ' Sealyham terrier', ' Airedale', ' cairn', ' Australian terrier', ' Dandie Dinmont', ' Boston bull', ' miniature schnauzer', ' giant schnauzer', ' standard schnauzer', ' Scotch terrier', ' Tibetan terrier', ' silky terrier', ' soft-coated wheaten terrier', ' West Highland white terrier', ' Lhasa', ' flat-coated retriever', ' curly-coated retriever', ' golden retriever', ' Labrador retriever', ' Chesapeake Bay retriever', ' German short-haired pointer', ' vizsla', ' English setter', ' Irish setter', ' Gordon setter', ' Brittany spaniel', ' clumber', ' English springer', ' Welsh springer spaniel', ' cocker spaniel', ' Sussex spaniel', ' Irish water spaniel', ' kuvasz', ' schipperke', ' groenendael', ' malinois', ' briard', ' kelpie', ' komondor', ' Old English sheepdog', ' Shetland sheepdog', ' collie', ' Border collie', ' Bouvier des Flandres', ' Rottweiler', ' German shepherd', ' Doberman', ' miniature pinscher', ' Greater Swiss Mountain dog', ' Bernese mountain dog', ' Appenzeller', ' EntleBucher', ' boxer', ' bull mastiff', ' Tibetan mastiff', ' French bulldog', ' Great Dane', ' Saint Bernard', ' Eskimo dog', ' malamute', ' Siberian husky', ' dalmatian', ' affenpinscher', ' basenji', ' pug', ' Leonberg', ' Newfoundland', ' Great Pyrenees', ' Samoyed', ' Pomeranian', ' chow', ' keeshond', ' Brabancon griffon', ' Pembroke', ' Cardigan', ' toy poodle', ' miniature poodle', ' standard poodle', ' Mexican hairless', ' timber wolf', ' white wolf', ' red wolf', ' coyote', ' dingo', ' dhole', ' African hunting dog', ' hyena', ' red fox', ' kit fox', ' Arctic fox', ' grey fox', ' tabby', ' tiger cat', ' Persian cat', ' Siamese cat', ' Egyptian cat', ' cougar', ' lynx', ' leopard', ' snow leopard', ' jaguar', ' lion', ' tiger', ' cheetah', ' brown bear', ' American black bear', ' ice bear', ' sloth bear', ' mongoose', ' meerkat', ' tiger beetle', ' ladybug', ' ground beetle', ' long-horned beetle', ' leaf beetle', ' dung beetle', ' rhinoceros beetle', ' weevil', ' fly', ' bee', ' ant', ' grasshopper', ' cricket', ' walking stick', ' cockroach', ' mantis', ' cicada', ' leafhopper', ' lacewing', ' dragonfly', ' damselfly', ' admiral', ' ringlet', ' monarch', ' cabbage butterfly', ' sulphur butterfly', ' lycaenid', ' starfish', ' sea urchin', ' sea cucumber', ' wood rabbit', ' hare', ' Angora', ' hamster', ' porcupine', ' fox squirrel', ' marmot', ' beaver', ' guinea pig', ' sorrel', ' zebra', ' hog', ' wild boar', ' warthog', ' hippopotamus', ' ox', ' water buffalo', ' bison', ' ram', ' bighorn', ' ibex', ' hartebeest', ' impala', ' gazelle', ' Arabian camel', ' llama', ' weasel', ' mink', ' polecat', ' black-footed ferret', ' otter', ' skunk', ' badger', ' armadillo', ' three-toed sloth', ' orangutan', ' gorilla', ' chimpanzee', ' gibbon', ' siamang', ' guenon', ' patas', ' baboon', ' macaque', ' langur', ' colobus', ' proboscis monkey', ' marmoset', ' capuchin', ' howler monkey', ' titi', ' spider monkey', ' squirrel monkey', ' Madagascar cat', ' indri', ' Indian elephant', ' African elephant', ' lesser panda', ' giant panda', ' barracouta', ' eel', ' coho', ' rock beauty', ' anemone fish', ' sturgeon', ' gar', ' lionfish', ' puffer', ' abacus', ' abaya', ' academic gown', ' accordion', ' acoustic guitar', ' aircraft carrier', ' airliner', ' airship', ' altar', ' ambulance', ' amphibian', ' analog clock', ' apiary', ' apron', ' ashcan', ' assault rifle', ' backpack', ' bakery', ' balance beam', ' balloon', ' ballpoint', ' Band Aid', ' banjo', ' bannister', ' barbell', ' barber chair', ' barbershop', ' barn', ' barometer', ' barrel', ' barrow', ' baseball', ' basketball', ' bassinet', ' bassoon', ' bathing cap', ' bath towel', ' bathtub', ' beach wagon', ' beacon', ' beaker', ' bearskin', ' beer bottle', ' beer glass', ' bell cote', ' bib', ' bicycle-built-for-two', ' bikini', ' binder', ' binoculars', ' birdhouse', ' boathouse', ' bobsled', ' bolo tie', ' bonnet', ' bookcase', ' bookshop', ' bottlecap', ' bow', ' bow tie', ' brass', ' brassiere', ' breakwater', ' breastplate', ' broom', ' bucket', ' buckle', ' bulletproof vest', ' bullet train', ' butcher shop', ' cab', ' caldron', ' candle', ' cannon', ' canoe', ' can opener', ' cardigan', ' car mirror', ' carousel', " carpenter's kit", ' carton', ' car wheel', ' cash machine', ' cassette', ' cassette player', ' castle', ' catamaran', ' CD player', ' cello', ' cellular telephone', ' chain', ' chainlink fence', ' chain mail', ' chain saw', ' chest', ' chiffonier', ' chime', ' china cabinet', ' Christmas stocking', ' church', ' cinema', ' cleaver', ' cliff dwelling', ' cloak', ' clog', ' cocktail shaker', ' coffee mug', ' coffeepot', ' coil', ' combination lock', ' computer keyboard', ' confectionery', ' container ship', ' convertible', ' corkscrew', ' cornet', ' cowboy boot', ' cowboy hat', ' cradle', ' crane', ' crash helmet', ' crate', ' crib', ' Crock Pot', ' croquet ball', ' crutch', ' cuirass', ' dam', ' desk', ' desktop computer', ' dial telephone', ' diaper', ' digital clock', ' digital watch', ' dining table', ' dishrag', ' dishwasher', ' disk brake', ' dock', ' dogsled', ' dome', ' doormat', ' drilling platform', ' drum', ' drumstick', ' dumbbell', ' Dutch oven', ' electric fan', ' electric guitar', ' electric locomotive', ' entertainment center', ' envelope', ' espresso maker', ' face powder', ' feather boa', ' file', ' fireboat', ' fire engine', ' fire screen', ' flagpole', ' flute', ' folding chair', ' football helmet', ' forklift', ' fountain', ' fountain pen', ' four-poster', ' freight car', ' French horn', ' frying pan', ' fur coat', ' garbage truck', ' gasmask', ' gas pump', ' goblet', ' go-kart', ' golf ball', ' golfcart', ' gondola', ' gong', ' gown', ' grand piano', ' greenhouse', ' grille', ' grocery store', ' guillotine', ' hair slide', ' hair spray', ' half track', ' hammer', ' hamper', ' hand blower', ' hand-held computer', ' handkerchief', ' hard disc', ' harmonica', ' harp', ' harvester', ' hatchet', ' holster', ' home theater', ' honeycomb', ' hook', ' hoopskirt', ' horizontal bar', ' horse cart', ' hourglass', ' iPod', ' iron', " jack-o'-lantern", ' jean', ' jeep', ' jersey', ' jigsaw puzzle', ' jinrikisha', ' joystick', ' kimono', ' knee pad', ' knot', ' lab coat', ' ladle', ' lampshade', ' laptop', ' lawn mower', ' lens cap', ' letter opener', ' library', ' lifeboat', ' lighter', ' limousine', ' liner', ' lipstick', ' Loafer', ' lotion', ' loudspeaker', ' loupe', ' lumbermill', ' magnetic compass', ' mailbag', ' mailbox', ' maillot', ' manhole cover', ' maraca', ' marimba', ' mask', ' matchstick', ' maypole', ' maze', ' measuring cup', ' medicine chest', ' megalith', ' microphone', ' microwave', ' military uniform', ' milk can', ' minibus', ' miniskirt', ' minivan', ' missile', ' mitten', ' mixing bowl', ' mobile home', ' Model T', ' modem', ' monastery', ' monitor', ' moped', ' mortar', ' mortarboard', ' mosque', ' mosquito net', ' motor scooter', ' mountain bike', ' mountain tent', ' mouse', ' mousetrap', ' moving van', ' muzzle', ' nail', ' neck brace', ' necklace', ' nipple', ' notebook', ' obelisk', ' oboe', ' ocarina', ' odometer', ' oil filter', ' organ', ' oscilloscope', ' overskirt', ' oxcart', ' oxygen mask', ' packet', ' paddle', ' paddlewheel', ' padlock', ' paintbrush', ' pajama', ' palace', ' panpipe', ' paper towel', ' parachute', ' parallel bars', ' park bench', ' parking meter', ' passenger car', ' patio', ' pay-phone', ' pedestal', ' pencil box', ' pencil sharpener', ' perfume', ' Petri dish', ' photocopier', ' pick', ' pickelhaube', ' picket fence', ' pickup', ' pier', ' piggy bank', ' pill bottle', ' pillow', ' ping-pong ball', ' pinwheel', ' pirate', ' pitcher', ' plane', ' planetarium', ' plastic bag', ' plate rack', ' plow', ' plunger', ' Polaroid camera', ' pole', ' police van', ' poncho', ' pool table', ' pop bottle', ' pot', " potter's wheel", ' power drill', ' prayer rug', ' printer', ' prison', ' projectile', ' projector', ' puck', ' punching bag', ' purse', ' quill', ' quilt', ' racer', ' racket', ' radiator', ' radio', ' radio telescope', ' rain barrel', ' recreational vehicle', ' reel', ' reflex camera', ' refrigerator', ' remote control', ' restaurant', ' revolver', ' rifle', ' rocking chair', ' rotisserie', ' rubber eraser', ' rugby ball', ' rule', ' running shoe', ' safe', ' safety pin', ' saltshaker', ' sandal', ' sarong', ' sax', ' scabbard', ' scale', ' school bus', ' schooner', ' scoreboard', ' screen', ' screw', ' screwdriver', ' seat belt', ' sewing machine', ' shield', ' shoe shop', ' shoji', ' shopping basket', ' shopping cart', ' shovel', ' shower cap', ' shower curtain', ' ski', ' ski mask', ' sleeping bag', ' slide rule', ' sliding door', ' slot', ' snorkel', ' snowmobile', ' snowplow', ' soap dispenser', ' soccer ball', ' sock', ' solar dish', ' sombrero', ' soup bowl', ' space bar', ' space heater', ' space shuttle', ' spatula', ' speedboat', ' spider web', ' spindle', ' sports car', ' spotlight', ' stage', ' steam locomotive', ' steel arch bridge', ' steel drum', ' stethoscope', ' stole', ' stone wall', ' stopwatch', ' stove', ' strainer', ' streetcar', ' stretcher', ' studio couch', ' stupa', ' submarine', ' suit', ' sundial', ' sunglass', ' sunglasses', ' sunscreen', ' suspension bridge', ' swab', ' sweatshirt', ' swimming trunks', ' swing', ' switch', ' syringe', ' table lamp', ' tank', ' tape player', ' teapot', ' teddy', ' television', ' tennis ball', ' thatch', ' theater curtain', ' thimble', ' thresher', ' throne', ' tile roof', ' toaster', ' tobacco shop', ' toilet seat', ' torch', ' totem pole', ' tow truck', ' toyshop', ' tractor', ' trailer truck', ' tray', ' trench coat', ' tricycle', ' trimaran', ' tripod', ' triumphal arch', ' trolleybus', ' trombone', ' tub', ' turnstile', ' typewriter keyboard', ' umbrella', ' unicycle', ' upright', ' vacuum', ' vase', ' vault', ' velvet', ' vending machine', ' vestment', ' viaduct', ' violin', ' volleyball', ' waffle iron', ' wall clock', ' wallet', ' wardrobe', ' warplane', ' washbasin', ' washer', ' water bottle', ' water jug', ' water tower', ' whiskey jug', ' whistle', ' wig', ' window screen', ' window shade', ' Windsor tie', ' wine bottle', ' wing', ' wok', ' wooden spoon', ' wool', ' worm fence', ' wreck', ' yawl', ' yurt', ' web site', ' comic book', ' crossword puzzle', ' street sign', ' traffic light', ' book jacket', ' menu', ' plate', ' guacamole', ' consomme', ' hot pot', ' trifle', ' ice cream', ' ice lolly', ' French loaf', ' bagel', ' pretzel', ' cheeseburger', ' hotdog', ' mashed potato', ' head cabbage', ' broccoli', ' cauliflower', ' zucchini', ' spaghetti squash', ' acorn squash', ' butternut squash', ' cucumber', ' artichoke', ' bell pepper', ' cardoon', ' mushroom', ' Granny Smith', ' strawberry', ' orange', ' lemon', ' fig', ' pineapple', ' banana', ' jackfruit', ' custard apple', ' pomegranate', ' hay', ' carbonara', ' chocolate sauce', ' dough', ' meat loaf', ' pizza', ' potpie', ' burrito', ' red wine', ' espresso', ' cup', ' eggnog', ' alp', ' bubble', ' cliff', ' coral reef', ' geyser', ' lakeside', ' promontory', ' sandbar', ' seashore', ' valley', ' volcano', ' ballplayer', ' groom', ' scuba diver', ' rapeseed', ' daisy', " yellow lady's slipper", ' corn', ' acorn', ' hip', ' buckeye', ' coral fungus', ' agaric', ' gyromitra', ' stinkhorn', ' earthstar', ' hen-of-the-woods', ' bolete', ' ear', ' toilet tissue']

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

var img_names = ['tench.jpg', 'goldfish.jpg', 'great_white_shark.jpg', 'tiger_shark.jpg', 'hammerhead.jpg', 'electric_ray.jpg', 'stingray.jpg', 'cock.jpg', 'hen.jpg', 'ostrich.jpg', 'brambling.jpg', 'goldfinch.jpg', 'house_finch.jpg', 'junco.jpg', 'indigo_bunting.jpg', 'robin.jpg', 'bulbul.jpg', 'jay.jpg', 'magpie.jpg', 'chickadee.jpg', 'water_ouzel.jpg', 'kite.jpg', 'bald_eagle.jpg', 'vulture.jpg', 'great_grey_owl.jpg', 'European_fire_salamander.jpg', 'common_newt.jpg', 'eft.jpg', 'spotted_salamander.jpg', 'axolotl.jpg', 'bullfrog.jpg', 'tree_frog.jpg', 'tailed_frog.jpg', 'loggerhead.jpg', 'leatherback_turtle.jpg', 'mud_turtle.jpg', 'terrapin.jpg', 'box_turtle.jpg', 'banded_gecko.jpg', 'common_iguana.jpg', 'American_chameleon.jpg', 'whiptail.jpg', 'agama.jpg', 'frilled_lizard.jpg', 'alligator_lizard.jpg', 'Gila_monster.jpg', 'green_lizard.jpg', 'African_chameleon.jpg', 'Komodo_dragon.jpg', 'African_crocodile.jpg', 'American_alligator.jpg', 'triceratops.jpg', 'thunder_snake.jpg', 'ringneck_snake.jpg', 'hognose_snake.jpg', 'green_snake.jpg', 'king_snake.jpg', 'garter_snake.jpg', 'water_snake.jpg', 'vine_snake.jpg', 'night_snake.jpg', 'boa_constrictor.jpg', 'rock_python.jpg', 'Indian_cobra.jpg', 'green_mamba.jpg', 'sea_snake.jpg', 'horned_viper.jpg', 'diamondback.jpg', 'sidewinder.jpg', 'trilobite.jpg', 'harvestman.jpg', 'scorpion.jpg', 'black_and_gold_garden_spider.jpg', 'barn_spider.jpg', 'garden_spider.jpg', 'black_widow.jpg', 'tarantula.jpg', 'wolf_spider.jpg', 'tick.jpg', 'centipede.jpg', 'black_grouse.jpg', 'ptarmigan.jpg', 'ruffed_grouse.jpg', 'prairie_chicken.jpg', 'peacock.jpg', 'quail.jpg', 'partridge.jpg', 'African_grey.jpg', 'macaw.jpg', 'sulphur-crested_cockatoo.jpg', 'lorikeet.jpg', 'coucal.jpg', 'bee_eater.jpg', 'hornbill.jpg', 'hummingbird.jpg', 'jacamar.jpg', 'toucan.jpg', 'drake.jpg', 'red-breasted_merganser.jpg', 'goose.jpg', 'black_swan.jpg', 'tusker.jpg', 'echidna.jpg', 'platypus.jpg', 'wallaby.jpg', 'koala.jpg', 'wombat.jpg', 'jellyfish.jpg', 'sea_anemone.jpg', 'brain_coral.jpg', 'flatworm.jpg', 'nematode.jpg', 'conch.jpg', 'snail.jpg', 'slug.jpg', 'sea_slug.jpg', 'chiton.jpg', 'chambered_nautilus.jpg', 'Dungeness_crab.jpg', 'rock_crab.jpg', 'fiddler_crab.jpg', 'king_crab.jpg', 'American_lobster.jpg', 'spiny_lobster.jpg', 'crayfish.jpg', 'hermit_crab.jpg', 'isopod.jpg', 'white_stork.jpg', 'black_stork.jpg', 'spoonbill.jpg', 'flamingo.jpg', 'little_blue_heron.jpg', 'American_egret.jpg', 'bittern.jpg', 'crane.jpg', 'limpkin.jpg', 'European_gallinule.jpg', 'American_coot.jpg', 'bustard.jpg', 'ruddy_turnstone.jpg', 'red-backed_sandpiper.jpg', 'redshank.jpg', 'dowitcher.jpg', 'oystercatcher.jpg', 'pelican.jpg', 'king_penguin.jpg', 'albatross.jpg', 'grey_whale.jpg', 'killer_whale.jpg', 'dugong.jpg', 'sea_lion.jpg', 'Chihuahua.jpg', 'Japanese_spaniel.jpg', 'Maltese_dog.jpg', 'Pekinese.jpg', 'Shih-Tzu.jpg', 'Blenheim_spaniel.jpg', 'papillon.jpg', 'toy_terrier.jpg', 'Rhodesian_ridgeback.jpg', 'Afghan_hound.jpg', 'basset.jpg', 'beagle.jpg', 'bloodhound.jpg', 'bluetick.jpg', 'black-and-tan_coonhound.jpg', 'Walker_hound.jpg', 'English_foxhound.jpg', 'redbone.jpg', 'borzoi.jpg', 'Irish_wolfhound.jpg', 'Italian_greyhound.jpg', 'whippet.jpg', 'Ibizan_hound.jpg', 'Norwegian_elkhound.jpg', 'otterhound.jpg', 'Saluki.jpg', 'Scottish_deerhound.jpg', 'Weimaraner.jpg', 'Staffordshire_bullterrier.jpg', 'American_Staffordshire_terrier.jpg', 'Bedlington_terrier.jpg', 'Border_terrier.jpg', 'Kerry_blue_terrier.jpg', 'Irish_terrier.jpg', 'Norfolk_terrier.jpg', 'Norwich_terrier.jpg', 'Yorkshire_terrier.jpg', 'wire-haired_fox_terrier.jpg', 'Lakeland_terrier.jpg', 'Sealyham_terrier.jpg', 'Airedale.jpg', 'cairn.jpg', 'Australian_terrier.jpg', 'Dandie_Dinmont.jpg', 'Boston_bull.jpg', 'miniature_schnauzer.jpg', 'giant_schnauzer.jpg', 'standard_schnauzer.jpg', 'Scotch_terrier.jpg', 'Tibetan_terrier.jpg', 'silky_terrier.jpg', 'soft-coated_wheaten_terrier.jpg', 'West_Highland_white_terrier.jpg', 'Lhasa.jpg', 'flat-coated_retriever.jpg', 'curly-coated_retriever.jpg', 'golden_retriever.jpg', 'Labrador_retriever.jpg', 'Chesapeake_Bay_retriever.jpg', 'German_short-haired_pointer.jpg', 'vizsla.jpg', 'English_setter.jpg', 'Irish_setter.jpg', 'Gordon_setter.jpg', 'Brittany_spaniel.jpg', 'clumber.jpg', 'English_springer.jpg', 'Welsh_springer_spaniel.jpg', 'cocker_spaniel.jpg', 'Sussex_spaniel.jpg', 'Irish_water_spaniel.jpg', 'kuvasz.jpg', 'schipperke.jpg', 'groenendael.jpg', 'malinois.jpg', 'briard.jpg', 'kelpie.jpg', 'komondor.jpg', 'Old_English_sheepdog.jpg', 'Shetland_sheepdog.jpg', 'collie.jpg', 'Border_collie.jpg', 'Bouvier_des_Flandres.jpg', 'Rottweiler.jpg', 'German_shepherd.jpg', 'Doberman.jpg', 'miniature_pinscher.jpg', 'Greater_Swiss_Mountain_dog.jpg', 'Bernese_mountain_dog.jpg', 'Appenzeller.jpg', 'EntleBucher.jpg', 'boxer.jpg', 'bull_mastiff.jpg', 'Tibetan_mastiff.jpg', 'French_bulldog.jpg', 'Great_Dane.jpg', 'Saint_Bernard.jpg', 'Eskimo_dog.jpg', 'malamute.jpg', 'Siberian_husky.jpg', 'dalmatian.jpg', 'affenpinscher.jpg', 'basenji.jpg', 'pug.jpg', 'Leonberg.jpg', 'Newfoundland.jpg', 'Great_Pyrenees.jpg', 'Samoyed.jpg', 'Pomeranian.jpg', 'chow.jpg', 'keeshond.jpg', 'Brabancon_griffon.jpg', 'Pembroke.jpg', 'Cardigan.jpg', 'toy_poodle.jpg', 'miniature_poodle.jpg', 'standard_poodle.jpg', 'Mexican_hairless.jpg', 'timber_wolf.jpg', 'white_wolf.jpg', 'red_wolf.jpg', 'coyote.jpg', 'dingo.jpg', 'dhole.jpg', 'African_hunting_dog.jpg', 'hyena.jpg', 'red_fox.jpg', 'kit_fox.jpg', 'Arctic_fox.jpg', 'grey_fox.jpg', 'tabby.jpg', 'tiger_cat.jpg', 'Persian_cat.jpg', 'Siamese_cat.jpg', 'Egyptian_cat.jpg', 'cougar.jpg', 'lynx.jpg', 'leopard.jpg', 'snow_leopard.jpg', 'jaguar.jpg', 'lion.jpg', 'tiger.jpg', 'cheetah.jpg', 'brown_bear.jpg', 'American_black_bear.jpg', 'ice_bear.jpg', 'sloth_bear.jpg', 'mongoose.jpg', 'meerkat.jpg', 'tiger_beetle.jpg', 'ladybug.jpg', 'ground_beetle.jpg', 'long-horned_beetle.jpg', 'leaf_beetle.jpg', 'dung_beetle.jpg', 'rhinoceros_beetle.jpg', 'weevil.jpg', 'fly.jpg', 'bee.jpg', 'ant.jpg', 'grasshopper.jpg', 'cricket.jpg', 'walking_stick.jpg', 'cockroach.jpg', 'mantis.jpg', 'cicada.jpg', 'leafhopper.jpg', 'lacewing.jpg', 'dragonfly.jpg', 'damselfly.jpg', 'admiral.jpg', 'ringlet.jpg', 'monarch.jpg', 'cabbage_butterfly.jpg', 'sulphur_butterfly.jpg', 'lycaenid.jpg', 'starfish.jpg', 'sea_urchin.jpg', 'sea_cucumber.jpg', 'wood_rabbit.jpg', 'hare.jpg', 'Angora.jpg', 'hamster.jpg', 'porcupine.jpg', 'fox_squirrel.jpg', 'marmot.jpg', 'beaver.jpg', 'guinea_pig.jpg', 'sorrel.jpg', 'zebra.jpg', 'hog.jpg', 'wild_boar.jpg', 'warthog.jpg', 'hippopotamus.jpg', 'ox.jpg', 'water_buffalo.jpg', 'bison.jpg', 'ram.jpg', 'bighorn.jpg', 'ibex.jpg', 'hartebeest.jpg', 'impala.jpg', 'gazelle.jpg', 'Arabian_camel.jpg', 'llama.jpg', 'weasel.jpg', 'mink.jpg', 'polecat.jpg', 'black-footed_ferret.jpg', 'otter.jpg', 'skunk.jpg', 'badger.jpg', 'armadillo.jpg', 'three-toed_sloth.jpg', 'orangutan.jpg', 'gorilla.jpg', 'chimpanzee.jpg', 'gibbon.jpg', 'siamang.jpg', 'guenon.jpg', 'patas.jpg', 'baboon.jpg', 'macaque.jpg', 'langur.jpg', 'colobus.jpg', 'proboscis_monkey.jpg', 'marmoset.jpg', 'capuchin.jpg', 'howler_monkey.jpg', 'titi.jpg', 'spider_monkey.jpg', 'squirrel_monkey.jpg', 'Madagascar_cat.jpg', 'indri.jpg', 'Indian_elephant.jpg', 'African_elephant.jpg', 'lesser_panda.jpg', 'giant_panda.jpg', 'barracouta.jpg', 'eel.jpg', 'coho.jpg', 'rock_beauty.jpg', 'anemone_fish.jpg', 'sturgeon.jpg', 'gar.jpg', 'lionfish.jpg', 'puffer.jpg', 'abacus.jpg', 'abaya.jpg', 'academic_gown.jpg', 'accordion.jpg', 'acoustic_guitar.jpg', 'aircraft_carrier.jpg', 'airliner.jpg', 'airship.jpg', 'altar.jpg', 'ambulance.jpg', 'amphibian.jpg', 'analog_clock.jpg', 'apiary.jpg', 'apron.jpg', 'ashcan.jpg', 'assault_rifle.jpg', 'backpack.jpg', 'bakery.jpg', 'balance_beam.jpg', 'balloon.jpg', 'ballpoint.jpg', 'Band_Aid.jpg', 'banjo.jpg', 'bannister.jpg', 'barbell.jpg', 'barber_chair.jpg', 'barbershop.jpg', 'barn.jpg', 'barometer.jpg', 'barrel.jpg', 'barrow.jpg', 'baseball.jpg', 'basketball.jpg', 'bassinet.jpg', 'bassoon.jpg', 'bathing_cap.jpg', 'bath_towel.jpg', 'bathtub.jpg', 'beach_wagon.jpg', 'beacon.jpg', 'beaker.jpg', 'bearskin.jpg', 'beer_bottle.jpg', 'beer_glass.jpg', 'bell_cote.jpg', 'bib.jpg', 'bicycle-built-for-two.jpg', 'bikini.jpg', 'binder.jpg', 'binoculars.jpg', 'birdhouse.jpg', 'boathouse.jpg', 'bobsled.jpg', 'bolo_tie.jpg', 'bonnet.jpg', 'bookcase.jpg', 'bookshop.jpg', 'bottlecap.jpg', 'bow.jpg', 'bow_tie.jpg', 'brass.jpg', 'brassiere.jpg', 'breakwater.jpg', 'breastplate.jpg', 'broom.jpg', 'bucket.jpg', 'buckle.jpg', 'bulletproof_vest.jpg', 'bullet_train.jpg', 'butcher_shop.jpg', 'cab.jpg', 'caldron.jpg', 'candle.jpg', 'cannon.jpg', 'canoe.jpg', 'can_opener.jpg', 'cardigan.jpg', 'car_mirror.jpg', 'carousel.jpg', "carpenter's_kit.jpg", 'carton.jpg', 'car_wheel.jpg', 'cash_machine.jpg', 'cassette.jpg', 'cassette_player.jpg', 'castle.jpg', 'catamaran.jpg', 'CD_player.jpg', 'cello.jpg', 'cellular_telephone.jpg', 'chain.jpg', 'chainlink_fence.jpg', 'chain_mail.jpg', 'chain_saw.jpg', 'chest.jpg', 'chiffonier.jpg', 'chime.jpg', 'china_cabinet.jpg', 'Christmas_stocking.jpg', 'church.jpg', 'cinema.jpg', 'cleaver.jpg', 'cliff_dwelling.jpg', 'cloak.jpg', 'clog.jpg', 'cocktail_shaker.jpg', 'coffee_mug.jpg', 'coffeepot.jpg', 'coil.jpg', 'combination_lock.jpg', 'computer_keyboard.jpg', 'confectionery.jpg', 'container_ship.jpg', 'convertible.jpg', 'corkscrew.jpg', 'cornet.jpg', 'cowboy_boot.jpg', 'cowboy_hat.jpg', 'cradle.jpg', 'crane.jpg', 'crash_helmet.jpg', 'crate.jpg', 'crib.jpg', 'Crock_Pot.jpg', 'croquet_ball.jpg', 'crutch.jpg', 'cuirass.jpg', 'dam.jpg', 'desk.jpg', 'desktop_computer.jpg', 'dial_telephone.jpg', 'diaper.jpg', 'digital_clock.jpg', 'digital_watch.jpg', 'dining_table.jpg', 'dishrag.jpg', 'dishwasher.jpg', 'disk_brake.jpg', 'dock.jpg', 'dogsled.jpg', 'dome.jpg', 'doormat.jpg', 'drilling_platform.jpg', 'drum.jpg', 'drumstick.jpg', 'dumbbell.jpg', 'Dutch_oven.jpg', 'electric_fan.jpg', 'electric_guitar.jpg', 'electric_locomotive.jpg', 'entertainment_center.jpg', 'envelope.jpg', 'espresso_maker.jpg', 'face_powder.jpg', 'feather_boa.jpg', 'file.jpg', 'fireboat.jpg', 'fire_engine.jpg', 'fire_screen.jpg', 'flagpole.jpg', 'flute.jpg', 'folding_chair.jpg', 'football_helmet.jpg', 'forklift.jpg', 'fountain.jpg', 'fountain_pen.jpg', 'four-poster.jpg', 'freight_car.jpg', 'French_horn.jpg', 'frying_pan.jpg', 'fur_coat.jpg', 'garbage_truck.jpg', 'gasmask.jpg', 'gas_pump.jpg', 'goblet.jpg', 'go-kart.jpg', 'golf_ball.jpg', 'golfcart.jpg', 'gondola.jpg', 'gong.jpg', 'gown.jpg', 'grand_piano.jpg', 'greenhouse.jpg', 'grille.jpg', 'grocery_store.jpg', 'guillotine.jpg', 'hair_slide.jpg', 'hair_spray.jpg', 'half_track.jpg', 'hammer.jpg', 'hamper.jpg', 'hand_blower.jpg', 'hand-held_computer.jpg', 'handkerchief.jpg', 'hard_disc.jpg', 'harmonica.jpg', 'harp.jpg', 'harvester.jpg', 'hatchet.jpg', 'holster.jpg', 'home_theater.jpg', 'honeycomb.jpg', 'hook.jpg', 'hoopskirt.jpg', 'horizontal_bar.jpg', 'horse_cart.jpg', 'hourglass.jpg', 'iPod.jpg', 'iron.jpg', "jack-o'-lantern.jpg", 'jean.jpg', 'jeep.jpg', 'jersey.jpg', 'jigsaw_puzzle.jpg', 'jinrikisha.jpg', 'joystick.jpg', 'kimono.jpg', 'knee_pad.jpg', 'knot.jpg', 'lab_coat.jpg', 'ladle.jpg', 'lampshade.jpg', 'laptop.jpg', 'lawn_mower.jpg', 'lens_cap.jpg', 'letter_opener.jpg', 'library.jpg', 'lifeboat.jpg', 'lighter.jpg', 'limousine.jpg', 'liner.jpg', 'lipstick.jpg', 'Loafer.jpg', 'lotion.jpg', 'loudspeaker.jpg', 'loupe.jpg', 'lumbermill.jpg', 'magnetic_compass.jpg', 'mailbag.jpg', 'mailbox.jpg', 'maillot.jpg', 'manhole_cover.jpg', 'maraca.jpg', 'marimba.jpg', 'mask.jpg', 'matchstick.jpg', 'maypole.jpg', 'maze.jpg', 'measuring_cup.jpg', 'medicine_chest.jpg', 'megalith.jpg', 'microphone.jpg', 'microwave.jpg', 'military_uniform.jpg', 'milk_can.jpg', 'minibus.jpg', 'miniskirt.jpg', 'minivan.jpg', 'missile.jpg', 'mitten.jpg', 'mixing_bowl.jpg', 'mobile_home.jpg', 'Model_T.jpg', 'modem.jpg', 'monastery.jpg', 'monitor.jpg', 'moped.jpg', 'mortar.jpg', 'mortarboard.jpg', 'mosque.jpg', 'mosquito_net.jpg', 'motor_scooter.jpg', 'mountain_bike.jpg', 'mountain_tent.jpg', 'mouse.jpg', 'mousetrap.jpg', 'moving_van.jpg', 'muzzle.jpg', 'nail.jpg', 'neck_brace.jpg', 'necklace.jpg', 'nipple.jpg', 'notebook.jpg', 'obelisk.jpg', 'oboe.jpg', 'ocarina.jpg', 'odometer.jpg', 'oil_filter.jpg', 'organ.jpg', 'oscilloscope.jpg', 'overskirt.jpg', 'oxcart.jpg', 'oxygen_mask.jpg', 'packet.jpg', 'paddle.jpg', 'paddlewheel.jpg', 'padlock.jpg', 'paintbrush.jpg', 'pajama.jpg', 'palace.jpg', 'panpipe.jpg', 'paper_towel.jpg', 'parachute.jpg', 'parallel_bars.jpg', 'park_bench.jpg', 'parking_meter.jpg', 'passenger_car.jpg', 'patio.jpg', 'pay-phone.jpg', 'pedestal.jpg', 'pencil_box.jpg', 'pencil_sharpener.jpg', 'perfume.jpg', 'Petri_dish.jpg', 'photocopier.jpg', 'pick.jpg', 'pickelhaube.jpg', 'picket_fence.jpg', 'pickup.jpg', 'pier.jpg', 'piggy_bank.jpg', 'pill_bottle.jpg', 'pillow.jpg', 'ping-pong_ball.jpg', 'pinwheel.jpg', 'pirate.jpg', 'pitcher.jpg', 'plane.jpg', 'planetarium.jpg', 'plastic_bag.jpg', 'plate_rack.jpg', 'plow.jpg', 'plunger.jpg', 'Polaroid_camera.jpg', 'pole.jpg', 'police_van.jpg', 'poncho.jpg', 'pool_table.jpg', 'pop_bottle.jpg', 'pot.jpg', "potter's_wheel.jpg", 'power_drill.jpg', 'prayer_rug.jpg', 'printer.jpg', 'prison.jpg', 'projectile.jpg', 'projector.jpg', 'puck.jpg', 'punching_bag.jpg', 'purse.jpg', 'quill.jpg', 'quilt.jpg', 'racer.jpg', 'racket.jpg', 'radiator.jpg', 'radio.jpg', 'radio_telescope.jpg', 'rain_barrel.jpg', 'recreational_vehicle.jpg', 'reel.jpg', 'reflex_camera.jpg', 'refrigerator.jpg', 'remote_control.jpg', 'restaurant.jpg', 'revolver.jpg', 'rifle.jpg', 'rocking_chair.jpg', 'rotisserie.jpg', 'rubber_eraser.jpg', 'rugby_ball.jpg', 'rule.jpg', 'running_shoe.jpg', 'safe.jpg', 'safety_pin.jpg', 'saltshaker.jpg', 'sandal.jpg', 'sarong.jpg', 'sax.jpg', 'scabbard.jpg', 'scale.jpg', 'school_bus.jpg', 'schooner.jpg', 'scoreboard.jpg', 'screen.jpg', 'screw.jpg', 'screwdriver.jpg', 'seat_belt.jpg', 'sewing_machine.jpg', 'shield.jpg', 'shoe_shop.jpg', 'shoji.jpg', 'shopping_basket.jpg', 'shopping_cart.jpg', 'shovel.jpg', 'shower_cap.jpg', 'shower_curtain.jpg', 'ski.jpg', 'ski_mask.jpg', 'sleeping_bag.jpg', 'slide_rule.jpg', 'sliding_door.jpg', 'slot.jpg', 'snorkel.jpg', 'snowmobile.jpg', 'snowplow.jpg', 'soap_dispenser.jpg', 'soccer_ball.jpg', 'sock.jpg', 'solar_dish.jpg', 'sombrero.jpg', 'soup_bowl.jpg', 'space_bar.jpg', 'space_heater.jpg', 'space_shuttle.jpg', 'spatula.jpg', 'speedboat.jpg', 'spider_web.jpg', 'spindle.jpg', 'sports_car.jpg', 'spotlight.jpg', 'stage.jpg', 'steam_locomotive.jpg', 'steel_arch_bridge.jpg', 'steel_drum.jpg', 'stethoscope.jpg', 'stole.jpg', 'stone_wall.jpg', 'stopwatch.jpg', 'stove.jpg', 'strainer.jpg', 'streetcar.jpg', 'stretcher.jpg', 'studio_couch.jpg', 'stupa.jpg', 'submarine.jpg', 'suit.jpg', 'sundial.jpg', 'sunglass.jpg', 'sunglasses.jpg', 'sunscreen.jpg', 'suspension_bridge.jpg', 'swab.jpg', 'sweatshirt.jpg', 'swimming_trunks.jpg', 'swing.jpg', 'switch.jpg', 'syringe.jpg', 'table_lamp.jpg', 'tank.jpg', 'tape_player.jpg', 'teapot.jpg', 'teddy.jpg', 'television.jpg', 'tennis_ball.jpg', 'thatch.jpg', 'theater_curtain.jpg', 'thimble.jpg', 'thresher.jpg', 'throne.jpg', 'tile_roof.jpg', 'toaster.jpg', 'tobacco_shop.jpg', 'toilet_seat.jpg', 'torch.jpg', 'totem_pole.jpg', 'tow_truck.jpg', 'toyshop.jpg', 'tractor.jpg', 'trailer_truck.jpg', 'tray.jpg', 'trench_coat.jpg', 'tricycle.jpg', 'trimaran.jpg', 'tripod.jpg', 'triumphal_arch.jpg', 'trolleybus.jpg', 'trombone.jpg', 'tub.jpg', 'turnstile.jpg', 'typewriter_keyboard.jpg', 'umbrella.jpg', 'unicycle.jpg', 'upright.jpg', 'vacuum.jpg', 'vase.jpg', 'vault.jpg', 'velvet.jpg', 'vending_machine.jpg', 'vestment.jpg', 'viaduct.jpg', 'violin.jpg', 'volleyball.jpg', 'waffle_iron.jpg', 'wall_clock.jpg', 'wallet.jpg', 'wardrobe.jpg', 'warplane.jpg', 'washbasin.jpg', 'washer.jpg', 'water_bottle.jpg', 'water_jug.jpg', 'water_tower.jpg', 'whiskey_jug.jpg', 'whistle.jpg', 'wig.jpg', 'window_screen.jpg', 'window_shade.jpg', 'Windsor_tie.jpg', 'wine_bottle.jpg', 'wing.jpg', 'wok.jpg', 'wooden_spoon.jpg', 'wool.jpg', 'worm_fence.jpg', 'wreck.jpg', 'yawl.jpg', 'yurt.jpg', 'web_site.jpg', 'comic_book.jpg', 'crossword_puzzle.jpg', 'street_sign.jpg', 'traffic_light.jpg', 'book_jacket.jpg', 'menu.jpg', 'plate.jpg', 'guacamole.jpg', 'consomme.jpg', 'hot_pot.jpg', 'trifle.jpg', 'ice_cream.jpg', 'ice_lolly.jpg', 'French_loaf.jpg', 'bagel.jpg', 'pretzel.jpg', 'cheeseburger.jpg', 'hotdog.jpg', 'mashed_potato.jpg', 'head_cabbage.jpg', 'broccoli.jpg', 'cauliflower.jpg', 'zucchini.jpg', 'spaghetti_squash.jpg', 'acorn_squash.jpg', 'butternut_squash.jpg', 'cucumber.jpg', 'artichoke.jpg', 'bell_pepper.jpg', 'cardoon.jpg', 'mushroom.jpg', 'Granny_Smith.jpg', 'strawberry.jpg', 'orange.jpg', 'lemon.jpg', 'fig.jpg', 'pineapple.jpg', 'banana.jpg', 'jackfruit.jpg', 'custard_apple.jpg', 'pomegranate.jpg', 'hay.jpg', 'carbonara.jpg', 'chocolate_sauce.jpg', 'dough.jpg', 'meat_loaf.jpg', 'pizza.jpg', 'potpie.jpg', 'burrito.jpg', 'red_wine.jpg', 'espresso.jpg', 'cup.jpg', 'eggnog.jpg', 'alp.jpg', 'bubble.jpg', 'cliff.jpg', 'coral_reef.jpg', 'geyser.jpg', 'lakeside.jpg', 'promontory.jpg', 'sandbar.jpg', 'seashore.jpg', 'valley.jpg', 'volcano.jpg', 'ballplayer.jpg', 'groom.jpg', 'scuba_diver.jpg', 'rapeseed.jpg', 'daisy.jpg', "yellow_lady's_slipper.jpg", 'corn.jpg', 'acorn.jpg', 'hip.jpg', 'buckeye.jpg', 'coral_fungus.jpg', 'agaric.jpg', 'gyromitra.jpg', 'stinkhorn.jpg', 'earthstar.jpg', 'hen-of-the-woods.jpg', 'bolete.jpg', 'ear.jpg', 'toilet_tissue.jpg'];
$(document).ready(function() {
    var idx = 0;
    for (i = 0; i < 999; i++) {
        console.log(i);
        imgdiv = '<div class="col-2 md-2" id="gallery"> <img style="width: 10%    height: 100%;" src="img/examples/' + img_names[i] +  '"/> ' + availableTags[i] + '</br></br> </div>';
        $('#extend').append(imgdiv);
//        if (i%5 == 0 && i >0) {
//            for (j=0; j<5; j++){
//                console.log("idx: ", idx);
//                divToAppend =  '<div class="col-2">' + availableTags[idx] + '</div>';
//                $('#extend').append(divToAppend);
//                idx +=1;
//            }
//        }
    }
});