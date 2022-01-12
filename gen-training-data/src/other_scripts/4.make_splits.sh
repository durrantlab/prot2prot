. which_style.sh

rm -rf ../output_splits_${style}
mkdir -p ../output_splits_${style}

mkdir -p ../output_splits_${style}/64
mkdir -p ../output_splits_${style}/128
mkdir -p ../output_splits_${style}/256
mkdir -p ../output_splits_${style}/512
mkdir -p ../output_splits_${style}/1024
mkdir -p ../output_splits_${style}/1024/test
mkdir -p ../output_splits_${style}/1024/train
mkdir -p ../output_splits_${style}/1024/val

# Make splits
ls ../output/*/model*png > t
head -n 150 t > t2
tail -n 150 t > t3
cat t t2 t3 | sort | uniq -c | grep " 1 " | awk '{print $2}' > t4

# Copy files to 1024
cat t2 | awk '{print "cp " $1 " ../output_splits/1024/test/"}' | sed "s/output_splits/output_splits_${style}/g" | parallel
cat t3 | awk '{print "cp " $1 " ../output_splits/1024/val/"}' | sed "s/output_splits/output_splits_${style}/g" | parallel
cat t4 | awk '{print "cp " $1 " ../output_splits/1024/train/"}' | sed "s/output_splits/output_splits_${style}/g" | parallel

# Now make other sizes
rm -f tmp
for dirname in `ls -1d ../output_splits_${style}/* | grep -v 1024`; do
    mkdir -p ${dirname}/test
    mkdir -p ${dirname}/train
    mkdir -p ${dirname}/val
    dimen=`basename ${dirname}`

    for src in `find ../output_splits_${style}/1024/ -name "*.png"`; do
        out=`echo ${src} | sed "s|/1024/|/$dimen/|g"`;
        ln="echo \"Resizing ${src}...\"; convert ${src} -resize ${dimen}x${dimen} ${out}"
        echo $ln >> tmp
    done
done

cat tmp | parallel
