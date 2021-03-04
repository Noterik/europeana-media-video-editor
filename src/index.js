import 'jquery-modal';

import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min.js';

import MatDialog from 'imports-loader?$=jquery!exports-loader?MatDialog!matdialog';
import 'matdialog/Dist/v 1.0.0/matdialog.min.css';

var { DataSet } = require('vis-data');
var { Timeline } = require('vis-timeline');

import 'vis-timeline/dist/vis-timeline-graph2d.min.css';

require('./icons/speech.svg');
require('./icons/note.svg');
require('./icons/title.svg');
require('./icons/spotlight.svg');
require('./icons/label.svg');
require('./icons/pause.svg');
require('./icons/check.svg');
require('./icons/empty.svg');

const EuropeanaMediaPlayer = require("EuropeanaMediaPlayer");
const languages = require("./components/languages/lang.js").default.locales;
const he = require('he'); 

var timelines = [];
var timeline;
var subtitleTimeline;
var timelinedata;
var currenttime;
var currentsubtitletime;
var timelineMoving = false;
var videoObj;
var options;
var players = [];
var incrementTimeout, incrementInterval;
var annotations;
var manifestJsonld = {};
var manifestMetadata = {};
var videoMetadata = {};
var temporalRange = [0,-1];
var subtitles;
var subtitleLanguages;
var subtitleTrack;
var pauseVideoWhileTyping = false;
var previousSubtitleLanguage = "en-GB";
var embedId;
var user;
var hsh;
var initSliderUpdateDone = false;

const timelineWindowViewPortDuration = 180000;
const subtitleTimelineWindowViewPortDuration = 15000;

window.addEventListener('load', () => {
  var tabs = document.querySelectorAll('.tabs')[0];
  let tabOptions = {duration: 300, onShow: tab_change}
  let tabsInstance = M.Tabs.init(tabs, tabOptions);

  var hash = window.location.hash;
  if (hash.length > 1) {
    //hash = hash.indexOf("?") > -1 ? hash.substring(0, hash.indexOf("?")) : hash;
    tabsInstance.select(hash.substr(1));
  }

  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems, tabOptions);
  
  //videoObj = {"manifest": "https://beta.qandr.eu/euscreenxlmanifestservlet/?videoid=http://stream18.noterik.com/progressive/stream18//domain/euscreenxl/user/eu_luce/video/EUS_EB001C7794C7B27B6BAA746AB17B6F23/rawvideo/1/raw.mp4&ticket=50680918&duration=41&maggieid=/domain/euscreenxl/user/eu_luce/video/EUS_EB001C7794C7B27B6BAA746AB17B6F23"};
  videoObj = {"manifest": "https://embd.eu/euscreenxlmanifestservlet/?videoid=https://stream18.noterik.com/progressive/stream18//domain/euscreenxl/user/eu_luce/video/EUS_EB001C7794C7B27B6BAA746AB17B6F23/rawvideo/1/raw.mp4&ticket=44338097&duration=41&maggieid=/domain/euscreenxl/user/eu_luce/video/EUS_EB001C7794C7B27B6BAA746AB17B6F23"};
  //videoObj = {"manifest": "https://iiif.europeana.eu/presentation//2059211/dyn_portal_index_seam_page_alo_aloId_11785/manifest?format=3"};
  //videoObj = { source: "EUS_C8664133069B4AC7B5AC68549FD44510", duration: 318, id: "testvideo", width: "640", height: "360"};
  //videoObj = {"manifest": "https://iiif.europeana.eu/presentation/2051914/data_euscreenXL_IL5000041487/manifest?format=3"};
  videoMetadata = videoObj;
  //videoObj = {manifest: "https://iiif.europeana.eu/presentation/2051906/data_euscreenXL_http___openbeelden_nl_media_90589/manifest?format=3&wskey=api2demo"};

  //options = { mode: "player", manifest: "https://iiif.europeana.eu/presentation/2051906/data_euscreenXL_http___openbeelden_nl_media_90589/manifest?format=3"};
  //options = {mode: "player", manifest: "https://videoeditor.noterik.com/manifest/createmanifest.php?src=http://openbeelden.nl/files/09/9983.9970.WEEKNUMMER403-HRE0001578C.mp4&duration=86360&id=http://openbeelden.nl/files/09/9983.9970.WEEKNUMMER403-HRE0001578C.mp4"};
  //options = {mode: "player", manifest: "https://iiif.europeana.eu/presentation/08609/fe9c5449_9522_4a70_951b_ef0b27893ae9/manifest?format=3&wskey=api2demo", editor: "https://video-editor.eu", language: "nl"};
  //options = {mode: "player", manifest: "https://beta.qandr.eu/euscreenxlmanifestservlet/?videoid=http://stream18.noterik.com/progressive/stream18//domain/euscreenxl/user/eu_luce/video/EUS_EB001C7794C7B27B6BAA746AB17B6F23/rawvideo/1/raw.mp4&ticket=50680918&duration=41&maggieid=/domain/euscreenxl/user/eu_luce/video/EUS_EB001C7794C7B27B6BAA746AB17B6F23"};
  options = {mode: "player", manifest: "https://embd.eu/euscreenxlmanifestservlet/?videoid=https://stream18.noterik.com/progressive/stream18//domain/euscreenxl/user/eu_luce/video/EUS_EB001C7794C7B27B6BAA746AB17B6F23/rawvideo/1/raw.mp4&ticket=44338097&duration=41&maggieid=/domain/euscreenxl/user/eu_luce/video/EUS_EB001C7794C7B27B6BAA746AB17B6F23"};
;  //options = {mode: "player", manifest: "https://iiif.europeana.eu/presentation//2059211/dyn_portal_index_seam_page_alo_aloId_11785/manifest?format=3"};
  //options = { mode: "player", manifest: "https://iiif.europeana.eu/presentation/9200369/webclient_DeliveryManager_pid_8412047_custom_att_2_simple_viewer/manifest?format=3&wskey=api2demo", editor: "https://video-editor.eu", language: "nl"};
  //options = { mode: "player", "manifest": "https://iiif.europeana.eu/presentation/22/_72315/manifest?format=3&wskey=api2demo", editor: "https://video-editor.eu", language: "nl"}
  //options = { mode: "player", "manifest": "https://iiif.europeana.eu/presentation/2051914/data_euscreenXL_IL5000041487/manifest?format=3", editor: "https://video-editor.eu", language: "nl"};
  if (getAllUrlParams(window.location.href).manifest != undefined) {
    options.manifest = decodeURIComponent(getAllUrlParams(window.location.href).manifest);
    videoObj.manifest = decodeURIComponent(getAllUrlParams(window.location.href).manifest);
  }
  if (getAllUrlParams(window.location.href).mode != undefined) {
    options.mode = getAllUrlParams(window.location.href).mode;
  }
  if (getAllUrlParams(window.location.href).user != undefined) {
    user = getAllUrlParams(window.location.href).user;
  }
  if (getAllUrlParams(window.location.href).hash != undefined) {
    hsh = getAllUrlParams(window.location.href).hash;
  }

  getEmbedId();

  $('.player-wrapper').each(function(index) {
    let p = new EuropeanaMediaPlayer($(this), videoObj, options);
    let player = p.player;

    var playerObject = {
      id: this.id, 
      player: player
    };
    players.push(playerObject);

    if (this.id == "annotation-player") {      
      var timeupdate;

      player.avcomponent.on('play', function() {
        timeupdate = setInterval(() => timeUpdate(player.avcomponent._getCurrentCanvas()._canvasClockTime * 1000, "annotation-player"), 50);
      });

      player.avcomponent.on('pause', function() {
        clearInterval(timeupdate);
      });

      player.avcomponent.on('mediaready', function() {
        manifestJsonld = player.manifest.__jsonld;
        manifestMetadata = manifestJsonld.metaData;

        let langCode = "";
        let language = "";
        let duration = 0;
        let width = 320;
        let height = 240;

        for (let [key, value] of Object.entries(manifestJsonld.rights)) {
          if (value == "allowed") {
            $('#'+key+"-tab").show();
          }
        }

        if (manifestJsonld.label) {
          $(".video-title").text(manifestJsonld.label[Object.keys(manifestJsonld.label)[0]]);
        }
          
        duration = manifestJsonld.items[0].duration;
        width = manifestJsonld.items[0].width;
        height = manifestJsonld.items[0].height;

        videoMetadata = {duration: duration, width: width, height: height};

        $("#resolution").append($("<option></option>").attr({"value": width+"x"+height, "data-icon":  "check.svg", selected: "selected"}).text(width+"x"+height));
        $("#resolution").append($("<option></option>").attr({"value": width*1.5+"x"+height*1.5, "data-icon":  "empty.svg"}).text(width*1.5+"x"+height*1.5));
        $("#resolution").append($("<option></option>").attr({"value": width*2+"x"+height*2, "data-icon":  "empty.svg"}).text(width*2+"x"+height*2));
       
        $("#resolution").trigger('contentChanged');

        setEmbedResolution();

        if (player.getMediaType(player) == "Video") {
          $("#embed-select-resolution").css({display: "flex" });
        }
  
        loadEmbedSlider();
        loadTimeline();

        //load annotations
        getAnnotations();

        player.avcomponent.canvasInstances[0]._$canvasTimelineContainer.on('slide', function(event, ui) {
          timeUpdate(ui.value * 1000, "annotation-player");
        });

        if (manifestMetadata.find(obj => obj.label.en[0] == "language")) {
          langCode = manifestMetadata.find(obj => obj.label.en[0] == "language" && obj.value[Object.keys(obj.value)[0]][0].length == 2).value[Object.keys(manifestMetadata.find(obj => obj.label.en[0] == "language" && obj.value[Object.keys(obj.value)[0]][0].length == 2).value)][0];
          if (langCode != undefined) {
            language = languages.find(lang => lang.code == langCode).name;
          } else {
            let tmpCode = manifestMetadata.find(obj => obj.label.en[0] == "language").value[Object.keys(manifestMetadata.find(obj => obj.label.en[0] == "language").value)][0];
            if (tmpCode != undefined) {
              langCode = languages.find(lang => lang.isoAlpha3 == tmpCode).name;
            }
          }
          
          $(".item-language-wrapper").show();
          $(".item-language").text(language);
        }
      });
    } else if (this.id == "subtitle-player") {  
      var subtitleTimeupdate;

      player.avcomponent.on('play', function() {
        subtitleTimeupdate = setInterval(() => timeUpdate(player.avcomponent._getCurrentCanvas()._canvasClockTime * 1000, "subtitle-player"), 50);
      });

      player.avcomponent.on('pause', function() {
        clearInterval(subtitleTimeupdate);
      });

      player.avcomponent.on('mediaready', function() {
        loadSubtitleTimeline();

        //load subtitles
        getSubtitles();

        //load bookmarks
        getBookmarks();

        player.avcomponent.canvasInstances[0]._$canvasTimelineContainer.on('slide', function(event, ui) {
          timeUpdate(ui.value * 1000, "subtitle-player");
        });  
      });
    }
  });

  $("[id^=copy-embed-]").on("change", function() {
    let type = $(this).val();
    let target = $(this).attr('id').substring(0, $(this).attr('id').lastIndexOf("-")) + "-input";

    let embedstring;
    let protocol = "https://";
    let link = "embd.eu/"+embedId;
    let resolution = $("#resolution").val();
    let temporal = "";

    if (temporalRange[0] != 0) {
      temporal += "?t="+temporalRange[0];
    }
    if (temporalRange[1] != videoMetadata.duration && temporalRange[1] != -1) {
      if (temporal.length == 0) {
        temporal += "?t=,";
      } else {
        temporal += ",";
      }
      temporal += temporalRange[1];
    }

    let width = parseInt(resolution.substring(0,resolution.indexOf("x"))) + 50;
    let height = parseInt(resolution.substring(resolution.indexOf("x")+1)) + 150;

    switch (type) {
      case "iframe":
        embedstring = '<iframe src="'+protocol+link+temporal+'" width="'+width+'" height="'+height+'" frameborder="0" allowfullscreen></iframe>';
      break;
      case "oembed":
        embedstring = protocol+"o."+link+temporal;
      break;
      case "manifest":
        embedstring = protocol+link+"/manifest"+temporal;
      break;
      default:
        embedstring = protocol+link+temporal;
      break;
    }

    $("#"+ target).val(embedstring);

    //update other tabs also with temporal information from the embed tab
    let id = $(this).attr('id');
    if (temporal != "" && id.indexOf("embed-embed") > 0) {
      ["annotation", "playlist", "subtitle"].forEach(function(t) {
        //take the other tabs correct type
        type = $("#"+id.replace("embed-embed", "embed-"+t)).val();
        
        switch (type) {
          case "iframe":
            embedstring = '<iframe src="'+protocol+link+temporal+'" width="'+width+'" height="'+height+'" frameborder="0" allowfullscreen></iframe>';
          break;
          case "oembed":
            embedstring = protocol+"o."+link+temporal;
          break;
          case "manifest":
            embedstring = protocol+link+"/manifest"+temporal;
          break;
          default:
            embedstring = protocol+link+temporal;
          break;
        }
        $("#"+target.replace("embed-embed", "embed-"+t)).val(embedstring);
      });
    }
  });

  $("[id^=copy-embed]").on('click', function() {
    $("#" + $(this).attr('id') + "-input").select();
    document.execCommand("copy");
  });

  $(".select-annotation-type select").on('change', function() {
    $(".select-annotation-type .select-wrapper input").removeClass(function (index, className) {
      return (className.match (/(^|\s)annotation-type-\S+/g) || []).join(' ');
    });
    if ($(this).val() != null) {
      $(".select-annotation-type .select-wrapper input").addClass("annotation-type-"+$(this).val()+"-background");
    }
  });

  $(".select-annotation select").on('change', function() {
    $(".select-annotation .select-wrapper input").removeClass(function (index, className) {
      return (className.match (/(^|\s)annotation-type-\S+/g) || []).join(' ');
    });
    if ($(this).val() != null) {
      $(".select-annotation .select-wrapper input").addClass("annotation-type-"+annotations.find(a => a.id == $(this).val()).type+"-background");
      /*console.log("select annotation id = "+$(this).val());
      let annotation = annotations.find(a => a.id == $(this).val());
      console.log(annotations.find(a => a.id == $(this).val()).type);*/
    }
  });

  $(".stepbackward").click(function() { $("#annotationtiming-start").val(formatTime(0, true)) });
  $(".stepforward").click(function() { $("#annotationtiming-end").val(formatTime(videoMetadata.duration * 1000, true)) });
  $(".annotationtiming-updown").on('mousedown', annotationtimingUpDownPressed);
  $(".annotationtiming-updown").on('mouseup', annotationtimingUpDownStopped);
  $(".annotationtiming-updown").on('mouseleave', annotationtimingUpDownStopped);

  $("#annotation-save-button").on("click", validateAnnotation);
  $("#annotation-cancel-button").on("click", function() { 
    $("#annotationtype").val("");
    $("#annotationtype").trigger("contentChanged");
    $("#annotationtype").trigger("change");
    
    $("#annotationlist").val("");
    $("#annotationlist").trigger('contentChanged');

    $(".annotation-input-text").val(""); 

    timeline.setSelection([]);
    removeInvalidFormFields();
  });

  $("#annotationlist").change(function() {
    var id = $("#annotationlist").val();
    //update type
    $("#annotationtype").val(annotations.find(a => a.id === id).type);
    $("#annotationtype").trigger("contentChanged");
    $("#annotationtype").trigger("change");
    //update text
    $("#annotationtext").val(annotations.find(a => a.id === id).text);
    //update timing
    $("#annotationtiming-start").val(formatTime(annotations.find(a => a.id === id).start, true));
    $("#annotationtiming-end").val(formatTime(annotations.find(a => a.id === id).end, true));
    //select in timeline
    selectAnnotation(annotations.find(a => a.id === id));

    removeInvalidFormFields();
  });

  $("#annotation-delete-button").click(function() {
    //get id of annotation to delete
    var id = $("#annotationlist").find("option:selected").attr("value");
    let annotation = annotations.find(a => a.id === id);
    annotations.splice(annotations.findIndex(a => a.id === id), 1);

    storeAnnotations();

    //update UI
    deselectAnnotation();
    updateAnnotationList(null);
    deleteAnnotation(annotation);
  });

  $('select').on('contentChanged', function() {
    M.FormSelect.init(this, {});
  });

  $("#annotationtext").on('keydown mousedown', function() {
    let playerObject = players.find(player => player.id == "annotation-player");
    playerObject.player.avcomponent.pause();
  });

  var elems = document.querySelectorAll('#playlistname-input');
  M.CharacterCounter.init(elems);  

  $("#playlist-save-name").on('click', function() {
    if ($("#playlistname-input").val() == "") {
      $("#playlistname-input").addClass("invalid-input-value");
      return;
    }

    savePlaylist();

    setTimeout(function() {
      $("#playlistname-input").removeClass("invalid-input-value");
      $("#playlistname").text($("#playlistname-input").val());
      $("#playlist-save-name").hide();
      $("#playlist-edit-name").show();
      $("#playlistname-input").hide();
      $("#playlistname").show();
      $(".character-counter").hide();
    }, 300);
  });

  $("#playlist-edit-name").on('click', function() {
    setTimeout(function() {
      $("#playlist-edit-name").hide();
      $("#playlist-save-name").show();
      $("#playlistname").hide();
      $("#playlistname-input").show();
      $(".character-counter").show();
    }, 300);
  });

  $("#playlistname-input").on('focus', function() {
    $("#playlistname-input").removeClass("invalid-input-value");
  });

  var elems = document.querySelectorAll('.modal');
  let modalOptions = {"startingTop": "15%", "endingTop": "15%"};
  var modalInstances = M.Modal.init(elems, modalOptions);

  $(document).on('click', ".bookmark-link", function() {
    let manifest = $(this).data("manifest");
    let title = $(this).data("title");
 
    var modalInstance = M.Modal.getInstance(document.querySelectorAll('.modal')[0]);
    modalInstance.close();

    $('<div class="playlist-video"><div class="playlist video-title-playlist semibold">'+title+'<a class="delete-playlist-item right semibold waves-effect waves-blue btn-flat" class="delete-playlist-item"><i class="delete-icon" aria-hidden="true"></a></div><div class="player-wrapper" data-manifest="'+manifest+'"></div></div>')
.insertBefore($('.playlist-video-add'));

    savePlaylist();

    $('.player-wrapper:empty').each(function(index) {
      let vObj = {manifest: $(this).data("manifest")};
      let opt = {mode: "player"};
      opt.manifest = $(this).data("manifest");

      let p = new EuropeanaMediaPlayer($(this), vObj, opt);
      let player = p.player;

      var playerObject = {
        id: this.id, 
        player: player
      };
      players.push(playerObject);
    });
  });

  $("#resolution").on('change', function() {
    $(this).children().each(function() {
      if ($(this).is(":selected")) {
        $(this).attr("data-icon", "check.svg");
      } else {
        $(this).attr("data-icon", "empty.svg");
      }
    });
    $(this).trigger('contentChanged');
    setEmbedResolution();
    $("#copy-embed-embed-type").trigger('change');

  });

  $("#add-subtitle").on('click', function() {
    //check if we have open edit boxes, close them
    $(".subtitle-input-text").each(function() {
      if ($(this).is(":visible")) {
        let that = this;
        saveSubtitle(that);
      }
    });

    //get current time position
    let playerObject = players.find(player => player.id == "subtitle-player");  
    let starttime = playerObject.player.avcomponent._getCurrentCanvas()._canvasClockTime * 1000;
    let endtime = (playerObject.player.avcomponent._getCurrentCanvas()._canvasClockTime * 1000) + 3000;

    let subtitleId = generateAnnotationId();

    //check if not in range of other sub
    if (subtitles) {
      let existingSubtitle = subtitles.find(s => starttime >= s.start && starttime <= s.end);
      if (existingSubtitle) {
        //set focus on existing subtitle
        $(".subtitle-wrapper[data-id='"+existingSubtitle.id+"'] > div.subtitle-text").hide();
        $(".subtitle-wrapper[data-id='"+existingSubtitle.id+"'] > textarea.subtitle-input-text").show().focus();
        return;
      }

      //order subtitles for this check
      subtitles.sort((a,b) => a.start - b.start);

      //check if endtime is not overlapping with other sub
      let overlappingSubtitle = subtitles.find(s => starttime < s.start && endtime > s.start);
      if (overlappingSubtitle) {
        //shorten subtitle so they do not overlap
        endtime = overlappingSubtitle.start;
      }
    }

    let subtitle = {};
    subtitle.id = subtitleId;
    subtitle.start = starttime;
    subtitle.end = endtime;
    subtitle.text = "";
    subtitle.language = $("#subtitle-language option:selected").val();
    subtitles.push(subtitle);
    addSubtitle(subtitle);

    let inserted = false;
    $(".subtitle-wrapper").each(function() {
      if (starttime < $(this).data("start")) {
        $('<div class="subtitle-wrapper" data-id="'+subtitleId+'" data-start="'+starttime+'" data-end="'+endtime+'"><div class="subtitle-timing">'+formatTime(starttime, true)+' - '+formatTime(endtime, true)+'</div><textarea class="subtitle-input-text validate" maxlength="100"></textarea><div class="subtitle-text" style="display:none;" tabindex="-1"><div class="edit-subtitle"></div><div class="delete-subtitle"></div></div></div>')
        .insertBefore($(this));
        inserted = true;
        return false;
      }
    });
    if (!inserted) {
      $(".subtitle-editor-frame").append('<div class="subtitle-wrapper" data-id="'+subtitleId+'" data-start="'+starttime+'" data-end="'+endtime+'"><div class="subtitle-timing">'+formatTime(starttime, true)+' - '+formatTime(endtime, true)+'</div><textarea class="subtitle-input-text validate" maxlength="100"></textarea><div class="subtitle-text" style="display:none;" tabindex="-1"><div class="edit-subtitle"></div><div class="delete-subtitle"></div></div></div>');
    }

    $(".subtitle-wrapper[data-id='"+subtitleId+"'] > textarea.subtitle-input-text").trigger("focus");
  });
  
  $(document).on({
    'focus': function() {
      //select subtitle in timeline
      let id = $(this).parent().data("id");
      let subtitle = subtitles.find(s => s.id === id);
      if (subtitle) {
        selectSubtitleInTimeline(subtitle);
      }
    },
    'blur': function() {
      subtitleTimeline.setSelection([]);
    }
  }, 'div.subtitle-text');

  $(document).on({
    'click': function() {
      let dataId = $(this).parent().parent().attr("data-id");

      //check if we have open edit boxes, close them
      $(".subtitle-input-text").each(function() {
        if ($(this).is(":visible")) {
          let that = this;
          saveSubtitle(that);
        }
      });

      //enable edit subtitle
      $(".subtitle-wrapper[data-id='"+dataId+"'] > .subtitle-text").hide();
      $(".subtitle-wrapper[data-id='"+dataId+"'] > .subtitle-input-text").show();
      $(".subtitle-wrapper[data-id='"+dataId+"'] > .subtitle-input-text").focus();
    }
  }, 'div.edit-subtitle');

  $(document).on({
    'click': function() {
      let dataId = $(this).parent().parent().attr("data-id");

      let removedItems = subtitleTimeline.itemsData.remove(dataId);

      if (removedItems.length == 0) {
        subtitles.splice(subtitles.findIndex(a => a.id === dataId), 1);
        updateSubtitleEditor(false);
      }
    }
  }, 'div.delete-subtitle');

  $("#subtitle-language").on("change", function() {  
      changeSubtitleLanguage();
  });

  //pause on typing subtitles
  $(document).on({
      'keydown': function(event) {
        if (pauseVideoWhileTyping) {
          let playerObject = players.find(player => player.id == "subtitle-player");
          playerObject.player.avcomponent.pause();
        }
        var keycode = event.keyCode || event.which;
        //on enter save subtitle
        if(keycode == '13') {
          let that = this;
          saveSubtitle(that);
        }
    }, 
    'keyup': function(event) {
      if ($(this).val().length >= (parseInt($(this).attr('maxlength')))) {
        $(this).addClass('invalid-form-value');
      } else {
        $(this).removeClass('invalid-form-value');
      }
    }
  }, 'textarea.subtitle-input-text');

  $("#pause-while-typing").on("change", function() {
    pauseVideoWhileTyping = this.checked ? true : false;
  });

  //Create WEBVTT subtitles from user input and offer for download
  $("#downloadsubtitle").on("click", function() {
    if (subtitleTrack) {
      let lang = subtitleTrack.language.substring(0,2);
      let header = "WEBVTT Kind: "+subtitleTrack.kind+"; Language: "+lang+"\r\n";
      let body = "";
      for (let i = 0; i < subtitleTrack.cues.length; i++) {
        let cue = subtitleTrack.cues[i];
        body += "\r\n"+ formatTime(cue.startTime * 1000, true, true) + " --> "+ formatTime(cue.endTime * 1000, true, true)+"\r\n"+cue.text+"\r\n";
      };

      let data = new Blob([header+body], {type: 'text/plain'});
      let url = URL.createObjectURL(data);
      let a = document.createElement('a');
      a.href = url;
      let title = $(".video-title").first().text().replace(/[#, ]/g,'_');
      a.download = title +"_"+lang+".webvtt";
      a.click();
    }
  });

  $("#annotation .preview-button").on('click', function() {
    let annotationPreviewUrl = "https://embd.eu/"+embedId;

    let temporal = "";

    if (temporalRange[0] != 0) {
      temporal += "?t="+temporalRange[0];
    }
    if (temporalRange[1] != videoMetadata.duration && temporalRange[1] != -1) {
      if (temporal.length == 0) {
        temporal += "?t=,";
      } else {
        temporal += ",";
      }
      temporal += temporalRange[1];
    }

    annotationPreviewUrl += temporal + "#annotations";

    let resolution = $("#resolution").val();
    let width = parseInt(resolution.substring(0,resolution.indexOf("x"))) + 50;
    let height = parseInt(resolution.substring(resolution.indexOf("x")+1)) + 150;

    window.open(annotationPreviewUrl, "popupWindow", "width="+width+",height="+height+",scrollbars=yes");
  });

  $("#subtitles .preview-button").on('click', function() {
      previewSubtitles();
  });

  $("#playlist .preview-button").on('click', function() {
    let playlistPreviewUrl = "https://embd.eu/"+embedId;
  
    let temporal = "";
  
    if (temporalRange[0] != 0) {
      temporal += "?t="+temporalRange[0];
    }
    if (temporalRange[1] != videoMetadata.duration && temporalRange[1] != -1) {
      if (temporal.length == 0) {
        temporal += "?t=,";
      } else {
        temporal += ",";
      }
      temporal += temporalRange[1];
    }
  
    playlistPreviewUrl += temporal;
  
    let resolution = $("#resolution").val();
    let width = parseInt(resolution.substring(0,resolution.indexOf("x"))) + 50;
    let height = parseInt(resolution.substring(resolution.indexOf("x")+1)) + 150;
  
    window.open(playlistPreviewUrl, "popupWindow", "width="+width+",height="+height+",scrollbars=yes");
  });

  $("#embed .preview-button").on('click', function() {
    let embedPreviewUrl = "https://embd.eu/"+embedId;
  
    let temporal = "";
  
    if (temporalRange[0] != 0) {
      temporal += "?t="+temporalRange[0];
    }
    if (temporalRange[1] != videoMetadata.duration && temporalRange[1] != -1) {
      if (temporal.length == 0) {
        temporal += "?t=,";
      } else {
        temporal += ",";
      }
      temporal += temporalRange[1];
    }
  
    embedPreviewUrl += temporal;
  
    let resolution = $("#resolution").val();
    let width = parseInt(resolution.substring(0,resolution.indexOf("x"))) + 50;
    let height = parseInt(resolution.substring(resolution.indexOf("x")+1)) + 150;
  
    window.open(embedPreviewUrl, "popupWindow", "width="+width+",height="+height+",scrollbars=yes");
  });

  $(".playlist-video .player-wrapper").attr({"data-manifest": options.manifest});

  //get playlist entries
  getPlaylist();

  $(document).on('click', ".delete-playlist-item", function() {
    $(this).parent().parent().remove();
    savePlaylist();
  });

  $(".embed-options-small-tab").on("click", function() {
    $("#"+$(this).data("target")).val($(this).data("value")).trigger("change");

    $(".embed-options-small-tab").removeClass("embed-options-small-tab-selected");
    $(this).addClass("embed-options-small-tab-selected");
  });

  $("#search").on('keydown', function(event) {
    var keycode = event.keyCode || event.which;
    //on enter save subtitle
    if(keycode == '13') {
      console.log($("#search").val());
    }
  });
});

function getAllUrlParams(url) {
  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      //if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {

        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }
  return obj;
}

function loadEmbedSlider() {
  var slider = document.getElementById('embed-slider');
  noUiSlider.create(slider, {
  start: [0, videoMetadata.duration * 1000],
  connect: true,
  behaviour: 'drag',
  step: 1000,
  range: {
    'min': 0,
    'max': videoMetadata.duration * 1000
  }
  });

  slider.noUiSlider.on('update', function (values, handle) {
    if (handle) {
        $('.noUi-handle-upper > .noUi-tooltip > span').text(formatTime(values[handle], false));
        temporalRange[1] = values[handle] / 1000;
        $("#copy-embed-embed-type").trigger('change');
        if (initSliderUpdateDone) {
          timeUpdate(values[handle], "embed-timeline");
        } else {}
        initSliderUpdateDone = true;
    } else {
        $('.noUi-handle-lower > .noUi-tooltip > span').text(formatTime(values[handle], false));
        temporalRange[0] = values[handle] / 1000;
        $("#copy-embed-embed-type").trigger('change');
        timeUpdate(values[handle], "embed-timeline");
    }
  });

  slider.noUiSlider.on('slide', function (values, handle) {
    if (!$('.noUi-handle-lower').hasClass('noUi-active') && !$('.noUi-handle-upper').hasClass('noUi-active')) {
      $('.noUi-handle-lower').addClass('noUi-active');
      $('.noUi-handle-upper').addClass('noUi-active');
    }
  });

  slider.noUiSlider.on('end', function(values, handle) {
    if ($('.noUi-handle-lower').hasClass('noUi-active') && $('.noUi-handle-upper').hasClass('noUi-active')) {
      $('.noUi-handle-lower').removeClass('noUi-active');
      $('.noUi-handle-upper').removeClass('noUi-active');
    }
  });
}

var timelineOptions = {
  format: {
    minorLabels: {
      millisecond: 'mm:ss.SS',
      second: 'mm:ss',
      minute: 'mm:ss',
      hour: 'HH:mm',
      weekday: 'HH:mm', 
      day: 'HH:mm',
      month: 'HH:mm',
      year: 'HH:mm',
    },
    majorLabels: function (date, scale, step) {
      return "";
    }
  },
  min: 0,
  max: videoMetadata.duration * 1000,
  onInitialDrawComplete: hideLoading,
  editable: {
    add: false,         // add new items by double tapping
    updateTime: true,  // drag items horizontally
    updateGroup: false, // drag items from one group to another
    remove: true,       // delete an item by tapping the delete button top right
    overrideItems: false  // allow these options to override item.editable
    }
}

function loadTimeline() {
  //TODO: display annotations from IIIF
  timelinedata = new DataSet([ ]);
  
  timelineOptions.max = videoMetadata.duration * 1000;

  timeline = new Timeline($("#annotation-timeline")[0], timelinedata, timelineOptions);

  currenttime = timeline.addCustomTime(0, "currenttime");

  var timelineObject = {
    id: "annotation-timeline", 
    timeline: timeline,
    currenttime: currenttime
  };
  timelines.push(timelineObject);

  //don't display time as alternative text
  timeline.setCustomTimeTitle("", "currenttime");

  timeline.on("timechange", function(properties) {
    if (properties.id == "currenttime") {
      timeUpdate((properties.time).getTime(), "annotation-timeline");
    }
  });

  timeline.on("select", function(properties) {
    //signal when a single item is selected
    if (properties.items.length == 1) {
      selectItem(properties.items[0]);
    } else if (properties.items.length == 0) {
      deselectAnnotation();
    }
  });

  timeline.itemsData.on("update", function(event, properties) {
    itemUpdate({id: properties.data[0].id, start: properties.data[0].start, end: properties.data[0].end});
  });

  timeline.itemsData.on("remove", function(event, properties) {
     //get id of annotation to delete
     var id = properties.items[0];
     let annotation = annotations.find(a => a.id === id);
     annotations.splice(annotations.findIndex(a => a.id === id), 1);
 
     storeAnnotations();
 
     //update UI
     deselectAnnotation();
     updateAnnotationList(null);
  });
}

function loadSubtitleTimeline() {
  //TODO: display subtitles from IIIF
  timelinedata = new DataSet([ ]);
  let subtitleTimelineOptions = timelineOptions;
  subtitleTimelineOptions.selectable = true;
  subtitleTimelineOptions.margin = {item: { horizontal: -1}};
  subtitleTimelineOptions.onMoving = function (item, callback) {
    //prevent overlapping of subtitles
    var overlapping = subtitleTimeline.itemsData.get({
      filter: function(testItem) {
        if (testItem.id == item.id) {
          return false;
        }
        return ((item.start < testItem.end) && (item.end > testItem.start));
      }
    });
    //only when no overlapping is found we do the callback
    if (overlapping.length == 0) {
      callback(item);
    }
  }

  subtitleTimeline = new Timeline($("#subtitle-timeline")[0], timelinedata, subtitleTimelineOptions);

  currentsubtitletime = subtitleTimeline.addCustomTime(0, "currenttime");

  var timelineObject = {
    id: "subtitle-timeline", 
    timeline: subtitleTimeline,
    currenttime: currentsubtitletime
  };
  timelines.push(timelineObject);
  //don't display time as alternative text
  subtitleTimeline.setCustomTimeTitle("", "currenttime");

  subtitleTimeline.on("timechange", function(properties) {
    if (properties.id == "currenttime") {
      timeUpdate((properties.time).getTime(), "subtitle-timeline");
    }
  });

  subtitleTimeline.on("select", function(properties) {
    //signal when a single item is selected
    if (properties.items.length == 1) {
      selectSubtitle(properties.items[0]);
    } else if (properties.items.length == 0) {
      deselectSubtitle();
    }
  });

  subtitleTimeline.itemsData.on("update", function(event, properties) {
    let subtitleEditId = "";
    let subtitleEditText = "";
    $(".subtitle-input-text").each(function() {
      if ($(this).is(":visible")) {
        subtitleEditId = $(this).parent().data("id");
        subtitleEditText = stripInput($(this).val());
      }
    });

    subtitleItemUpdate({id: properties.data[0].id, start: properties.data[0].start, end: properties.data[0].end});

    if (subtitleEditId !== "") {
      $(".subtitle-wrapper[data-id='"+subtitleEditId+"'] > div.subtitle-text").hide();
      $(".subtitle-wrapper[data-id='"+subtitleEditId+"'] > textarea.subtitle-input-text").val(subtitleEditText).show().focus();
    }
    storeSubtitles();
  });

  subtitleTimeline.itemsData.on("remove", function(event, properties, senderId) {
     //get id of subtitle to delete
     var id = properties.items[0];
     subtitles.splice(subtitles.findIndex(a => a.id === id), 1);
 
     if (senderId != "change-language") {
      storeSubtitles();

      //get subtitle in video
      let cue = subtitleTrack.cues.getCueById(id);
      //remove existing cue
      subtitleTrack.removeCue(cue);
     }
 
     //update UI
     updateSubtitleEditor(false);
  });
}

function tab_change() {
  //pause all players on a tab change
  players.forEach(function(player) {
    player.player.avcomponent.pause();
  });
}

function formatTime(time, millis = false, threeDigitMillis = false) {
  time = time < 0 ? 0 : time;
  time = time > (videoMetadata.duration * 1000) ? (videoMetadata.duration * 1000) : time;

  let hours = Math.floor(time / 3600000);
  let minutes = Math.floor(time / 60000);
  let seconds;
  if (millis) {
    seconds = Math.floor((time % 60000) / 1000);
  } else {
    seconds = Math.ceil((time % 60000) / 1000);
  }

  let timestring = hours > 0 ? hours+":" : "";
  timestring += minutes < 10 ? "0"+minutes+":" : minutes+":";
  timestring += seconds < 10 ? "0"+seconds : seconds;

  if (millis) {
    let milliseconds = threeDigitMillis ? Math.floor(time % 1000) : Math.floor((time % 1000) / 10);
    if (threeDigitMillis) {
      if (milliseconds < 10) { 
        timestring += ".00" + milliseconds;
      } else if (milliseconds < 100) {
        timestring += ".0" + milliseconds;
      } else {
        timestring += "." + milliseconds
      }
    } else {
      if (milliseconds < 10) {
        timestring += ".0" + milliseconds;
      } else {
        timestring += "." + milliseconds;
      }
    }
  }

  return timestring;
}

function deformatTime(time, millis = false) {
  let parts = time.split(":");

  parts = parts.length > 3 ? parts.slice(parts.length-3) : parts; 
  for (let i = parts.length; i < 3; i++) {
    parts.unshift(0);
  }

  let hours = parseInt(parts[0]);
  let minutes = parseInt(parts[1]);
  let seconds;
  let milliseconds;
  if (millis) {
    let secmsparts = parts[2].split(".");
    seconds = parseInt(secmsparts[0]);
    if (secmsparts[1].length == 2) {
      milliseconds = parseInt(secmsparts[1]) * 10;
    } else {
      milliseconds = parseInt(secmparts[1]);
    }
  } else {
    seconds = parseInt(parts[2]);
    milliseconds = 0;
  }
  return (hours*3600 + minutes*60 + seconds) * 1000 + milliseconds;
}

function hideLoading() {
  timelines.forEach(function(timeline) {
    if (timeline.id == "subtitle-timeline") {
      timeline.timeline.setWindow(0, subtitleTimelineWindowViewPortDuration);
    } else {
      timeline.timeline.setWindow(0, timelineWindowViewPortDuration);
    }
    timeline.timeline.setCustomTime(0, timeline.currenttime);
  });
  
  $(".vis-custom-time div").each(function() {
    if ($(this).find(".vis-custom-time-handle").length == 0) {
      $(this).append("<div class='vis-custom-time-handle'></div>");
    }
  });
}

function timeUpdate(data, source) {
  //update annotation time boxes, take boundaries into account
  let time = data < 0 ? 0 : data;
  time = time > (videoMetadata.duration * 1000) ? (videoMetadata.duration * 1000) : time;
  let endtime = time + 10000 > (videoMetadata.duration * 1000) ? (videoMetadata.duration * 1000) : time + 10000;

  $("#annotationtiming-start").val(formatTime(time, true));
  $("#annotationtiming-end").val(formatTime(endtime, true));

  //update timeline
  if (source.indexOf("timeline") == -1) {
    let type = source.substring(0, source.indexOf("-"));

    let tl = type == "annotation" ? timeline : subtitleTimeline;
    let ct = type == "annotation" ? currenttime : currentsubtitletime;

    if (tl !== undefined && !timelineMoving) {
      tl.setCustomTime(time, ct);
      //if we run out of the window go to next / prev window with same dimensions

      //time is running after timeline
      if (time > tl.getWindow().end.getTime()) {
        timelineMoving = true;
        let start = tl.getWindow().end.getTime();
        let end = type == "annotation" ? start + timelineWindowViewPortDuration : start + subtitleTimelineWindowViewPortDuration;
        end = end > (videoMetadata.duration * 1000) ? (videoMetadata.duration * 1000) : end;
        tl.setWindow(start, end, true, timelineMoved);
      }

      //time is running before timeline
      if (time < tl.getWindow().start.getTime()) {
        timelineMoving = true;
        let start = type == "annotation" ? tl.getWindow().start.getTime() - timelineWindowViewPortDuration : tl.getWindow().start.getTime() - subtitleTimelineWindowViewPortDuration;
        start = start < 0 ? 0 : start;
        let end = tl.getWindow().start.getTime();
        tl.setWindow(start, end, timelineMoved);
      }
    }
  }

  //update player
  if (source.indexOf("player") == -1) {
    let type = source.substring(0, source.indexOf("-"));

    let playerObject = players.find(player => player.id == type+"-player");
    playerObject.player.avcomponent._getCurrentCanvas().setCurrentTime(time / 1000);
  }
}

function timelineMoved() {
  timelineMoving = false;
}

function annotationtimingUpDownPressed(e) {
  let targetId = e.target.id;
  let inputTarget = "#annotationtiming-";
  let incrementPositive = targetId.indexOf("up") > 0 ? true : false;
  let increment = incrementPositive ? 500 : -500;
  inputTarget += incrementPositive ? targetId.substring(0, targetId.indexOf("up")) : targetId.substring(0, targetId.indexOf("down"));
  $(inputTarget).val(formatTime((deformatTime($(inputTarget).val(), true) + increment), true));

  incrementTimeout = setTimeout(function() {
    incrementInterval = setInterval(function() {
      incrementValue(inputTarget, increment);
    }, 50);
  }, 300);
}

function incrementValue(target, increment) {
  $(target).val(formatTime((deformatTime($(target).val(), true) + increment), true));
}

function annotationtimingUpDownStopped(e) {
  //cancel timer and interval
  clearTimeout(incrementTimeout);
  clearTimeout(incrementInterval);  
}

function setUniqueEUPSId() {    
  let id = uuidv4();

  var expires = new Date();
  expires.setTime(expires.getTime() + (2 * 365 * 24 * 60 * 60 * 1000));
  document.cookie = 'eups_id=' + id + ';expires=' + expires.toUTCString();

  return id;
}

function getUniqueEUPSId() {
  var keyValue = document.cookie.match('(^|;) ?eups_id=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : setUniqueEUPSId();
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

function generateAnnotationId() {
  return generateId(8);
}

function generateId(length) {
  let id = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function getEmbedId() {
  let link = "https://video-editor.eu/api/embed/"+getUniqueEUPSId()+"/"+encodeURIComponent(options.manifest);

  fetch(
      link, { 
          method: 'GET',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8" }
      })
  .then(res => res.json())
  .then(response => {
      let embedString = "https://embd.eu/"+response.embed;
      ['embed', 'annotation', 'playlist', 'subtitle'].forEach(type => $("#copy-embed-"+type+"-input").val(embedString));

      embedId = response.embed;
  })
  .catch(err => {
      console.error("Could not retrieve embed link");
      console.log(err);
  });
}

function setEmbedResolution() {
  let link = "https://video-editor.eu/api/embed/"+getUniqueEUPSId()+"/"+encodeURIComponent(options.manifest);

  let resolution = $("#resolution").val();
  let width = parseInt(resolution.substring(0,resolution.indexOf("x")));
  let height = parseInt(resolution.substring(resolution.indexOf("x")+1));

  fetch(
      link, { 
          method: 'POST',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8"
          },
          body: JSON.stringify({"width": width, "height": height})
      })
  .then(res => res.json())
  .then(response => {

  })
  .catch(err => {
      console.error("Could not save embed resolution");
  });
}

function getAnnotations() {
  let link = "https://video-editor.eu/api/annotations/"+getUniqueEUPSId()+"/"+encodeURIComponent(options.manifest);

  fetch(
      link, { 
          method: 'GET',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8" }
      })
  .then(res => res.json())
  .then(response => {
      annotations = response;
      annotations.forEach(function(annotation) {
        addAnnotation(annotation);
      });
      updateAnnotationList(null);
  })
  .catch(err => {
      console.error("Could not retrieve annotations");
      console.log(err);
  });
}

function storeAnnotations() {
  let link = "https://video-editor.eu/api/annotations/"+getUniqueEUPSId()+"/"+encodeURIComponent(options.manifest);

  fetch(
      link, { 
          method: 'POST',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8"
          },
          body: JSON.stringify(annotations)
      })
  .then(res => res.json())
  .then(response => {

  })
  .catch(err => {
      console.error("Could not save annotations");
  });
}

function validateAnnotation() {
  var annotationForm = $('#annotation-form');
	//check if form has all required and validated time input
	if(! annotationForm[0].checkValidity()) {
    if ($("#annotationtype").val() == null) {
      $(".select-annotation-type .select-wrapper input.select-dropdown").addClass("invalid-form-value");
    }
    if ($("#annotationtext").val() == "") {
      $("#annotationtext").addClass("invalid-form-value");
    }        
    return;
  } else {
    removeInvalidFormFields();
  }
  //check if start & endtime do exist, otherwise correct
	let endTime = deformatTime($("#annotationtiming-end").val(), true) > (videoObj.duration * 1000) ? (videoObj.duration * 1000) : deformatTime($("#annotationtiming-end").val(), true);
	$("#annotationtiming-end").val(formatTime(endTime, true));
	let startTime = deformatTime($("#annotationtiming-start").val(), true);
	startTime = validateStartTime(startTime);	
	$("#annotationtiming-start").val(formatTime(startTime, true));

  var currentid = $("#annotationlist").val();

	let annotation = {};
	annotation.text = stripInput($("#annotationtext").val());
	annotation.start = startTime;
	annotation.end = endTime;
  annotation.type = $("#annotationtype").val();
  annotation.id = currentid !== undefined  && currentid != "" ? currentid : generateAnnotationId();
  
	if (currentid !== undefined && currentid != "") {
		annotations[annotations.findIndex(a => a.id === annotation.id)] = annotation;
	} else {
		annotations.push(annotation);
  }
  updateAnnotationList(null);

  if (currentid !== undefined && currentid != "") {
    updateAnnotation(annotation);
  } else {
    addAnnotation(annotation);
  }
  storeAnnotations();

  deselectAnnotation();
}

function updateAnnotationList(itemSelectedId) {
  //update annotation list
  let annotationselect = $("#annotationlist");
  annotationselect.empty();
  
  annotationselect.append($("<option></option>").attr("value", "").text("Select an annotation"));
  
  //order annotations based on their starttime
  annotations.sort((a,b) => a.start - b.start);

  Object.keys(annotations).forEach(function(key, index) {
    if (itemSelectedId != null && annotations[key].id == itemSelectedId) {
      annotationselect.append($("<option></option>").attr({"value": annotations[key].id, "data-icon":  annotations[key].type+".svg", selected: "selected"}).text(annotations[key].text +" ["+formatTime(annotations[key].start)+"]"));
    } else {
      annotationselect.append($("<option></option>").attr({"value": annotations[key].id, "data-icon": annotations[key].type+".svg"}).text(annotations[key].text +" ["+formatTime(annotations[key].start)+"]"));
    }    
  });

  if (itemSelectedId != null) {
    removeInvalidFormFields();
  }

  annotationselect.trigger('contentChanged');
}

function validateStartTime(newTime) {
  newTime = newTime > (videoMetadata.duration * 1000) ? (videoMetadata.duration * 1000) : newTime;
  //also make sure endtime is at least equal or bigger then the starttime
  if (deformatTime($("#annotationtiming-end").val(), true) < newTime) {
    newTime = deformatTime($("#annotationtiming-end").val(), true);
  }
  return newTime;
}

function deselectAnnotation() {
  //update type
  $("#annotationtype").val("");
  $("#annotationtype").trigger('contentChanged');
  $("#annotationtype").trigger("change");
  //update select annotation list
  $("#annotationlist").val("");
  $("#annotationlist").trigger('contentChanged');
  //update text
  $("#annotationtext").val("");

  timeline.setSelection([]);
}

function addAnnotation(annotation) {
  timeline.itemsData.add([{id: annotation.id, content: annotation.text, start: annotation.start, end: annotation.end}]);
}

function updateAnnotation(annotation) {
  let update = {id: annotation.id, content: annotation.text, start: annotation.start, end: annotation.end};
  timeline.itemsData.update([update]);
}

function deleteAnnotation(annotation) {
  timeline.itemsData.remove(annotation.id);
}

function selectAnnotation(annotation) {
  timeline.setSelection(annotation.id);

  //annotation start is after timeline window
  if (annotation.start > timeline.getWindow().end.getTime()) {
    timelineMoving = true;
    let start = annotation.start
    let end = start + timelineWindowViewPortDuration;
    end = end > (videoMetadata.duration * 1000) ? (videoMetadata.duration * 1000) : end;
    timeline.setWindow(start, end, true, timelineMoved);
  }

  //time is running before timeline
  if (annotation.start < timeline.getWindow().start.getTime()) {
    timelineMoving = true;
    let start = annotation.start;
    start = start < 0 ? 0 : start;
    let end = annotation.start + timelineWindowViewPortDuration;
    timeline.setWindow(start, end, timelineMoved);
  }
}

function selectItem(annotationId) {
  if (annotations.find(a => a.id === annotationId)) {
    $("#annotationlist").val(annotationId);
    $("#annotationlist").trigger('contentChanged');
    $("#annotationlist").trigger("change");
  } else {
    deselectAnnotation();
  }	
}

function itemUpdate(item) {
  let annotation = annotations[annotations.findIndex(a => a.id === item.id)];
  annotation.start = item.start instanceof Date ? item.start.getTime() : item.start;
  annotation.end = item.end instanceof Date ? item.end.getTime() : item.end;

  annotations[annotations.findIndex(a => a.id === item.id)] = annotation;

  //store
  storeAnnotations();

  updateAnnotationList(item.id);

  $("#annotationtiming-start").val(formatTime(annotation.start, true));
  $("#annotationtiming-end").val(formatTime(annotation.end, true));
}

function removeInvalidFormFields () {
  $(".select-annotation-type input").removeClass("invalid-form-value");
  $("#annotationtext").removeClass("invalid-form-value");
}

function getSubtitleLanguages() {
  let link = "https://video-editor.eu/api/subtitles/"+getUniqueEUPSId()+"/"+encodeURIComponent(options.manifest);

  return fetch(
    link, { 
        method: 'GET',
        mode: 'cors',
        headers: { "Content-Type": "application/json; charset=utf-8" }
    })
  .then(res => res.json())
  .catch(err => {
    console.error("Could not retrieve subtitle languages");
    console.log(err);
  });
}

function getSubtitlesInLanguage(language) {
  let link = "https://video-editor.eu/api/subtitles/"+getUniqueEUPSId()+"/"+encodeURIComponent(options.manifest)+"/"+language;

  return fetch(
    link, { 
        method: 'GET',
        mode: 'cors',
        headers: { "Content-Type": "application/json; charset=utf-8" }
    })
  .then(res => res.json())
  .catch(err => {
    console.error("Could not retrieve subtitles in language "+language);
    console.log(err);
  });
}

function getSubtitles() {
  let link = "https://video-editor.eu/api/subtitles/"+getUniqueEUPSId()+"/"+encodeURIComponent(options.manifest)+"/"+$("#subtitle-language option:selected").val();
  //remove subtitles from old language
  if (subtitleTrack) {
    let cueLength = subtitleTrack.cues.length;
    for (let i = cueLength-1; i >= 0; i--) {
      subtitleTrack.removeCue(subtitleTrack.cues[i]);
    }
  }

  fetch(
      link, { 
          method: 'GET',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8" }
      })
  .then(res => res.json())
  .then(response => {
      subtitles = response;
      //add subtitle track
      subtitleTrack = $("#subtitle-player video")[0].addTextTrack("subtitles", "user_subitles", $("#subtitle-language option:selected").val());
      subtitles.forEach(function(subtitle) {
        addSubtitle(subtitle);
      });
      updateSubtitleEditor(true);
      subtitleTrack.mode = "showing";
  })
  .catch(err => {
      console.error("Could not retrieve subtitles");
      console.log(err);
  });
}

function storeSubtitles() {
  let link = "https://video-editor.eu/api/subtitles/"+getUniqueEUPSId()+"/"+encodeURIComponent(options.manifest)+"/"+$("#subtitle-language option:selected").val();

  let subtitlesToStore = subtitles.filter(subtitle => subtitle.text.length > 0);

  fetch(
      link, { 
          method: 'POST',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8"
          },
          body: JSON.stringify(subtitlesToStore)
      })
  .then(res => res.json())
  .then(response => {

  })
  .catch(err => {
      console.error("Could not save subtitles");
  });
}

function addSubtitle(subtitle) {
  var cue = new VTTCue(subtitle.start/1000, subtitle.end/1000, subtitle.text);
  cue.id = subtitle.id;
  cue.line = -4;
  cue.size = 90;
  subtitleTrack.addCue(cue);
  subtitleTimeline.itemsData.add([{id: subtitle.id, content: subtitle.text, start: subtitle.start, end: subtitle.end, language: subtitle.language}]);
}

function updateSubtitle(subtitle) {
  //update subtitle in video
  let cue = subtitleTrack.cues.getCueById(subtitle.id);
  //remove existing cue
  if (cue != null) {
    //update existing item
    subtitleTrack.removeCue(cue);  
    cue.text = subtitle.text;
    cue.startTime = subtitle.start / 1000;
    cue.endTime = subtitle.end / 1000;
  } else {
    //add suggested subtitle
    cue = new VTTCue(subtitle.start/1000, subtitle.end/1000, subtitle.text);
    cue.id = subtitle.id;
    cue.line = -4;
    cue.size = 90;
  }
 
  //add updated cue
  subtitleTrack.addCue(cue);

  //update subtitle in timeline
  let update = {id: subtitle.id, content: subtitle.text, start: subtitle.start, end: subtitle.end, language: subtitle.language};
  subtitleTimeline.itemsData.update([update]);
}

function subtitleItemUpdate(item) {
  let subtitle = subtitles[subtitles.findIndex(a => a.id === item.id)];
  subtitle.start = item.start instanceof Date ? item.start.getTime() : item.start;
  subtitle.end = item.end instanceof Date ? item.end.getTime() : item.end;

  subtitles[subtitles.findIndex(a => a.id === item.id)] = subtitle;

  //update UI
  updateSubtitleEditor(false);

  //update subtitle in video
  let cue = subtitleTrack.cues.getCueById(item.id);
  //remove existing cue
  subtitleTrack.removeCue(cue);
  cue.text = subtitle.text;
  cue.startTime = subtitle.start / 1000;
  cue.endTime = subtitle.end / 1000;
  //add updated cue
  subtitleTrack.addCue(cue);
}

function updateSubtitleEditor(newLanguage) {
  //order subtitles based on their starttime
  subtitles.sort((a,b) => a.start - b.start);

  if (newLanguage) {
    //check if there is another language with more subtitles
    getSubtitleLanguages().then(subtitleLanguages => {
      let languageWithMostSubtitles = subtitleLanguages.reduce((a,b)=>a.number_of_subtitles > b.number_of_subtitles ? a : b).language;
      
      //if there is another language with more subtitles
      if ($("#subtitle-language option:selected").val() != languageWithMostSubtitles) {
        //get those subtitles
        getSubtitlesInLanguage(languageWithMostSubtitles).then(subs => {
          //let mergedSubtitles = subtitles;
          subs.sort((a,b) => a.start - b.start);
        
          subs.forEach((sub) => {
            //check if the starts fits in a range
            let startFound = subtitles.find(s => sub.start >= s.start && sub.start < s.end);
            let endFound = subtitles.find(s => sub.end > s.start && sub.end <= s.end);

            //and fill empty subtitle nodes to speed up translations
            if (!startFound && !endFound) {
              sub.text = "";
              sub.id = generateAnnotationId();
              subtitles.push(sub);
            }
          });
          subtitles.sort((a,b) => a.start - b.start);  
          fillEditorUI();        
        });
      } else {
        fillEditorUI();
      }
    });
  } else {
    fillEditorUI();
  }
}

function fillEditorUI() {
  //clear current subtitles
  $(".subtitle-wrapper").each(function() {
    $(this).remove();
  });

  subtitles.forEach(function(subtitle) {
    let subtitleHTML = '<div class="subtitle-wrapper" data-id="'+subtitle.id+'" data-start="'+subtitle.start+'" data-end="'+subtitle.end+'">';
    subtitleHTML += '<div class="subtitle-timing">'+formatTime(subtitle.start, true)+' - '+formatTime(subtitle.end, true)+'</div>';
    subtitleHTML += '<textarea class="subtitle-input-text validate" maxlength="100" style="display:none;">'+subtitle.text+'</textarea><div class="subtitle-text';
    subtitleHTML += subtitle.text == "" ? ' empty-subtitle-text"' : '"';
    subtitleHTML += ' tabindex="-1">'+subtitle.text+'<div class="edit-subtitle"></div><div class="delete-subtitle"></div></div></div>';

    $(".subtitle-editor-frame").append(subtitleHTML);
  });
}

function selectSubtitle(subtitleId) {
  if (subtitles.find(s => s.id === subtitleId)) {
    $(".subtitle-wrapper[data-id='"+subtitleId+"'] > div.subtitle-text").trigger("focus");
  } else {
    deselectSubtitle();
  }	
}

function deselectSubtitle() {
  $("div.subtitle-text:focus").trigger("blur");

  subtitleTimeline.setSelection([]);
}

function selectSubtitleInTimeline(subtitle) {
  subtitleTimeline.setSelection(subtitle.id);

  //subtitle start is after timeline window
  if (subtitle.start > subtitleTimeline.getWindow().end.getTime()) {
    timelineMoving = true;
    let start = subtitle.start
    let end = start + subtitleTimelineWindowViewPortDuration;
    end = end > (videoMetadata.duration * 1000) ? (videoMetadata.duration * 1000) : end;
    subtitleTimeline.setWindow(start, end, true, timelineMoved);
  }

  //time is running before timeline
  if (subtitle.start < subtitleTimeline.getWindow().start.getTime()) {
    timelineMoving = true;
    let start = subtitle.start;
    start = start < 0 ? 0 : start;
    let end = subtitle.start + subtitleTimelineWindowViewPortDuration;
    subtitleTimeline.setWindow(start, end, timelineMoved);
  }
}

function stripInput(input) {
  let strippedInput = input.replace(/<[^>]+>/g, '');
  return he.decode(strippedInput);
}

function savePlaylist() {
  let name = $("#playlistname-input").val();
  let link = "https://video-editor.eu/api/playlist/"+getUniqueEUPSId()+"/"+encodeURIComponent(options.manifest);

  let entries = [];
  $(".playlist-video .player-wrapper").each(function(index) {
    let id = $(this).data("id") == undefined ? generateAnnotationId() : $(this).data("id");
    let title = $(this).prev().text();
    entries.push({"id": id,"playlisttitle": name,"title": title, "vid": $(this).data("manifest"), "position": index+1});
  });

  fetch(
      link, { 
          method: 'POST',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8"
          },
          body: JSON.stringify(entries)
      })
  .then(res => res.json())
  .then(response => {

  })
  .catch(err => {
      console.error("Could not save playlist");
  });
}

function getPlaylist() {
  let link = "https://video-editor.eu/api/playlist/"+getUniqueEUPSId()+"/"+encodeURIComponent(options.manifest);

  fetch(
      link, { 
          method: 'GET',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8" }
      })
  .then(res => res.json())
  .then(response => {
      let entries = response;

      if (entries.length > 0) {
        $(".playlist-video").remove();

        $("#playlistname-input").val(entries[0].playlisttitle);

        entries.forEach(function(entry) {   
          if (entry.vid == options.manifest)  {
            $('<div class="playlist-video"><div class="playlist video-title-playlist semibold">'+entry.title+'</div><div id="'+entry.id+'" class="player-wrapper" data-id="'+entry.id+'" data-manifest="'+entry.vid+'"></div></div>')
    .insertBefore($('.playlist-video-add'));
          } else {
            $('<div class="playlist-video"><div class="playlist video-title-playlist semibold">'+entry.title+'<a class="delete-playlist-item right semibold waves-effect waves-blue btn-flat"><i class="delete-icon" aria-hidden="true"></a></div><div id="'+entry.id+'" class="player-wrapper" data-id="'+entry.id+'" data-manifest="'+entry.vid+'"></div></div>')
    .insertBefore($('.playlist-video-add'));
          }
        });
        
        $('.player-wrapper:empty').each(function(index) {
          let vObj = {manifest: $(this).data("manifest")};
          let opt = {mode: "player"};
          opt.manifest = $(this).data("manifest");

          let p = new EuropeanaMediaPlayer($(this), vObj, opt);
          let player = p.player;

          var playerObject = {
            id: this.id, 
            player: player
          };
          players.push(playerObject);
        });
      }
  })
  .catch(err => {
      console.error("Could not retrieve playlist entries");
      console.log(err);
  });
}

function changeSubtitleLanguage() {
  previousSubtitleLanguage = $("#subtitle-language").val();
  //clear timeline subtitles
  subtitleTimeline.itemsData.clear("change-language");

  //retrieve correct language subtitles
  getSubtitles();
}

function previewSubtitles() {
  let subtitlePreviewUrl = "https://embd.eu/"+embedId;

    let temporal = "";

    if (temporalRange[0] != 0) {
      temporal += "?t="+temporalRange[0];
    }
    if (temporalRange[1] != videoMetadata.duration && temporalRange[1] != -1) {
      if (temporal.length == 0) {
        temporal += "?t=,";
      } else {
        temporal += ",";
      }
      temporal += temporalRange[1];
    }

    let language = $("#subtitle-language").val().substring(0,2);

    subtitlePreviewUrl += temporal + "#"+language;

    let resolution = $("#resolution").val();
    let width = parseInt(resolution.substring(0,resolution.indexOf("x"))) + 50;
    let height = parseInt(resolution.substring(resolution.indexOf("x")+1));

    window.open(subtitlePreviewUrl, "popupWindow", "width="+width+",height="+height+",scrollbars=yes");
}

function saveSubtitle(that) {
  $(that).hide();
  //copy text
  let text = stripInput($(that).val());
  //find existing subtitle
  let id = $(that).parent().data("id");
  let subtitle = subtitles.find(s => s.id === id);
  subtitle.text = text;

  storeSubtitles();

  if (subtitle.text != "") {
    //update subtitle
    updateSubtitle(subtitle);
    subtitles[subtitles.findIndex(s => s.id === subtitle.id)] = subtitle;
    
    $(that).next().removeClass("empty-subtitle-text");
  }
 
  if ($(that).next().text() == "") {
    $(that).next().prepend(text);
  } else {
    $(that).next().text(text);
  }
  $(that).next().show();
}

function getBookmarks() {
  if (user !== undefined && hsh !== undefined) {
    let link = "https://video-editor.eu/api/bookmarks/user/"+encodeURIComponent(user)+"/hash/"+encodeURIComponent(hsh);
    fetch(
        link, { 
            method: 'GET',
            mode: 'cors',
            headers: { "Content-Type": "application/json; charset=utf-8" }
        })
    .then(res => res.json())
    .then(response => {
        let bookmarks = response.bookmarks;
        let i = 0;
        let bookmarkhtml = "";

        bookmarks.forEach(function(bookmark) {
          if(i%2 == 0) {
            bookmarkhtml += '<div class="row">';
          }
          bookmarkhtml += '<div class="col s6 bookmark"><a href="#" class="bookmark-link" data-manifest="'+bookmark.manifest+'" data-title="'+bookmark.title+'"><div class="bookmark-image-wrapper"><div class="bookmark-overlay"></div><img class="bookmark-image" src="'+bookmark.thumbnail+'"></div><div class="bookmark-title semibold">'+bookmark.title+'</div></a></div>';
          if(i%2 == 1) {
            bookmarkhtml += '</div>';
          }
          i++;
        });
        $("#bookmarks").append(bookmarkhtml);
        
    })
    .catch(err => {
        console.error("Could not retrieve bookmarks");
        console.log(err);
    });
  }
}