export reso=${1}

cd pytorch-CycleGAN-and-pix2pix

python test.py --no_flip --netG unet_128 --load_size ${reso} --crop_size ${reso} --preprocess none --norm instance --dataroot ../imgs/size_${reso}_full/ --name prot_render_${reso} --model pix2pix 

cd -

mkdir -p export
cd export
rm -rf export_${reso}*
mv ../pytorch-CycleGAN-and-pix2pix/export.onnx ./export_${reso}.onnx

onnx-tf convert --infile export_${reso}.onnx --outdir export_${reso}

# in my tests, full and quantize_float16 don't look different from uint16. But uint8 looks different (still ok, though).

#tensorflowjs_converter --control_flow_v2=True --input_format=tf_saved_model --metadata= --quantize_uint16=* --saved_model_tags=serve --signature_name=serving_default --strip_debug_ops=True --weight_shard_size_bytes=4194304 export_${reso}/ export_${reso}_uint16_tfjs

tensorflowjs_converter --control_flow_v2=True --input_format=tf_saved_model --metadata= --quantize_uint8=* --saved_model_tags=serve --signature_name=serving_default --strip_debug_ops=True --weight_shard_size_bytes=4194304 export_${reso}/ export_${reso}_uint8_tfjs

# Below is full model, for comparison.
#tensorflowjs_converter --control_flow_v2=True --input_format=tf_saved_model --metadata= --saved_model_tags=serve --signature_name=serving_default --strip_debug_ops=True --weight_shard_size_bytes=4194304 export_${reso}/ export_${reso}_full_tfjs

