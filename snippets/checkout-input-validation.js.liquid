{% if enable %}
<script>
Checkout.$(document).on('ready page:load page:change', function() {
  
  var regex = /^(((p[\s\.]?[o\s][\.]?)\s?)|(post\s?office\s?))((box|bin|b\.?)?\s?(num|number|#)?\s?\d+)/gmi;
  var isValid = true;
  var fieldErrorClass = 'field--error';
  var fieldErrorMessageSelector = '.field__message--error';
  var errorText = "{{ 'plus.checkout.po_box_rejection_message' | t }}";
  var $inputs = Checkout.$("[data-step] input:visible");

  var regexCheckFn = function(elem) {
      
    var $current = Checkout.$(elem);
    var $parent = $current.closest('.field__input-wrapper');
    var $field = $current.closest('.field');

    if (regex.test($current.val())) {
      
      isValid = false;

      if (!$field.hasClass(fieldErrorClass)) {
        $field.addClass(fieldErrorClass);
      }
      
      if ($field.find(fieldErrorMessageSelector).length < 1) {
        $parent.after("<p class='field__message field__message--error'>"+ errorText +"</p>");
      }
      
    } else {
      
      if ($field.hasClass(fieldErrorClass)) {
        $field.removeClass(fieldErrorClass);
      }
      
      if ($field.find(fieldErrorMessageSelector).length > 0) {
        $field.find(fieldErrorMessageSelector).remove();
      }
      
    }
      
  };

  // Call regex check on form submit
  Checkout.$(document).on('submit', '[data-step] form', function() {
    // default to true and will be set to false if there is an error to prevent form submission
    isValid = true;
    
    $inputs.each(function() {
      regexCheckFn(Checkout.$(this));
    });
    
    if (!isValid) {
      return false;
    }
    
  });

  // Call regex check on blur
  $inputs.blur(function() {
    regexCheckFn(Checkout.$(this));
  });

});
</script>
{% endif %}