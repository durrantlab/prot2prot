dir=${@%/}

rm -rf ./${dir}_tfjs/

tensorflowjs_converter --input_format=keras_saved_model --metadata= ./${dir}/ ./${dir}_full_tfjs/

tensorflowjs_converter --input_format=keras_saved_model --metadata= --quantize_float16=* ./${dir} ./${dir}_float16_tfjs/

# I tested all these, and the below looks like the full model but is much smaller.
# Good to use this one.
tensorflowjs_converter --input_format=keras_saved_model --metadata= --quantize_uint16=* ./${dir}/ ./${dir}_uint16_tfjs/

# This one doesn't look but, but does look different than the full model.
# Half as large as one above (good one).
tensorflowjs_converter --input_format=keras_saved_model --metadata= --quantize_uint8=* ./${dir}/ ./${dir}_uint8_tfjs/
