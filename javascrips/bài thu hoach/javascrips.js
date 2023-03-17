

function Validator(options) {
    function getParent(element, selector) {
        while(element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement
        }
    }
    var selectorRules = {};
    // Hàm thực hiện validate (nếu chưa nhập thì blur sễ / ngược lại thì bỏ qua)
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelctor).querySelector('.form-message');
        var errorMessage;
        var rules = selectorRules[rule.selector];
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }
        if(errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelctor).classList.add('invalid')
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelctor).classList.remove('invalid')
        }
        return !errorMessage;
    }
    var formElement = document.querySelector(options.form)
    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;
            // lặp qua từng rule và validate 
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector);
                
                var isValid= validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false;
                }
            });
            
            if (isFormValid) {
                // trường hợp submit với js
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not(disanabled)');
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) return values;
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                                
                            default:    
                                (values[input.name] = input.value)
                        }
                        return values;
                    },{});
                    options.onSubmit(formValues) 
                    // trường hợp submit với hành vi mặc định
                } else {
                    formElement.submit();
                }
            } 
        }
        // lặp qua các rule và xử lí event (input, save rule, blur,....)
        options.rules.forEach(function(rule) {
            // xử lí lưu lại 
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement) {
                //xử lí case blur out input
                inputElement.onblur = function ( ) {
                    validate(inputElement, rule);
                }
                // xử lí case đang nhập vào
                inputElement.oninput = function () {
                    validate(inputElement, rule)
                }
            });
           
        });
    }
}

// Định nghĩa rules
Validator.isRepuired = function(selector) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : 'Vui lòng nhập thông tin vào ô này'
        }
    }
}
Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function (value) {
           var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập email theo mẫu examle@email.com...'; 
        }
    }
}
Validator.isMinlength = function(selector, min) {
    return {
        selector: selector,
        test: function (value) {
          
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`; 
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
          
            return value === getConfirmValue() ? undefined : message || 'Giá trị không chính xác...'; 
        }
    }
    
}