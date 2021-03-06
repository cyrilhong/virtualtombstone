$(function() {
  var posting = false;
  $.when($.get('/user')).then(function(user, status, e) {
    if (user.code && user.code === 99) {
      $.cookie('beforeLoginURL', location.href.replace(location.origin, ''));
      location.href = '/auth/facebook';
    } else {
      init(user);
    };
  }, function(fail, status, e) {
  });

  function init(user) {
    $('#build').on('submit', user, postForm);
    $('#image-cropper').cropit();
    $('#build_date').datepicker({
      changeMonth: true,
      changeYear: true
    });

    // 時間不讓使用者自己輸入, 一定要靠 datepicker
    $('#build_date').on('keydown', function(e) {return false;});
  };

  function postForm(e) {
    e.preventDefault();
      var postData = new FormData(this),
        postUrl = '/user/' + e.data._id + '/vts',
        cropitExport = $('#image-cropper').cropit('export'),
        blob = null;

      if (!!cropitExport === false || $('#build_topic').val().length === 0 || $('#build_content').val().length === 0 || $('#build_date').val().length === 0) {
        alert('請上傳照片、輸入標題、內文與日期');
        return false;
      };

      blob = dataURItoBlob(cropitExport);
      postData.append('picture', blob, "cropit.png");

      if (posting === false) {
        posting = true;
        $.ajax({
          url: postUrl,
          type: 'POST',
          data:  postData,
          mimeType: 'multipart/form-data',
          contentType: false,
          cache: false,
          processData:false,
          success: function(data, textStatus, jqXHR) {
            var vt = JSON.parse(data);
            // var $picture = $('#build_picture'),
            //   $topic = $('#build_topic'),
            //   $content = $('#build_content');
            //   $picture.val('');
            //   $topic.val('');
            //   $content.val('');
            //   posting = false;
            // 直接轉址
            // 貼文到 FB 上去
            // if (!!$('.share-fb input:checked').val()) {
              // 沒有 checkbox, 直接分享到 fb
              $.post('https://graph.facebook.com/me/feed?message=我建立了一個虛擬紀念碑 -  ' + vt.vtName +', ' + vt.vtDes
                + '&picture=http://virtualtombstone.co/' + vt.vtPhoto
                + '&link=http://virtualtombstone.co/tombstone.html?vtid=' + vt._id
                + '&access_token=' + e.data.token, function(){
                  location.href = reactParam.tombstoneUrl + '?vtid=' + $.parseJSON(data)._id;
                });
            // } else {
            //   location.href = reactParam.tombstoneUrl + '?vtid=' + $.parseJSON(data)._id;
            // };
          },
          error: function(jqXHR, textStatus, errorThrown) {
            posting = false
          }          
        });
      };
      e.preventDefault();
  };

  function changePic(e) {
    var images = e.delegateTarget.files;
    if (images.length > 0 && !!FileReader) {
      var render = new FileReader();
      render.onload = function(fileEvent) {
        $('.upload_img img').attr('src', fileEvent.target.result);
      };
      render.readAsDataURL(images[0]);
    } else {
      $('.upload_img img').attr('src', '');
    };
  };

  function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    };

    return new Blob([ia], {type:mimeString});
  };
});