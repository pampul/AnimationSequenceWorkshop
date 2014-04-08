/**
 * Created by Flo on 20/10/2013.
 */


$(document).ready(function () {
  $('.shake-button').each(function () {
    $(this).hover(function () {
      $(this).addClass('shake animated');
    }, function () {
      $(this).removeClass('shake animated');
    });
  })

  $('.hotspot').each(function(){
    $(this).fadeIn();
  })
});