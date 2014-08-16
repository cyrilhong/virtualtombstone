/** @jsx React.DOM */
$(function() {
  var uid = url('?uid', location.href) || '', // 使用者 ID
    dataUrl = ''; // 取資料的路徑

  // 當網址有使用者 ID 資訊就列出使用者的所有墓碑, 若無列出 server 中的所有墓碑
  if (uid !== '') {
    dataUrl = '/user/' + uid + '/vts';
  } else {
    dataUrl = '/vts';
  };
  $.when($.get(dataUrl)).then(function(res, status, e) {
    // succes
    var length = res.length,
      vt = [],
      index = 0;
    for (var i = length - 1; i >= 0; i--) {
      vt[index] = res[i];
      index++;
    };

    React.renderComponent(
      <reactTombstones data={vt} />,
      document.getElementById('main')
    );
  }, function(res, status, e) {
    // failure
  });
});
