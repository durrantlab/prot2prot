rm -rf ../output_splits
mkdir -p ../output_splits

mkdir -p ../output_splits/64
mkdir -p ../output_splits/128
mkdir -p ../output_splits/256
mkdir -p ../output_splits/512
mkdir -p ../output_splits/1024
mkdir -p ../output_splits/1024/test
mkdir -p ../output_splits/1024/train
mkdir -p ../output_splits/1024/val

# Make splits
ls ../output/*/model*png > t
head -n 150 t > t2
tail -n 150 t > t3
cat t t2 t3 | sort | uniq -c | grep " 1 " | awk '{print $2}' > t4

# Copy files to 1024
cat t2 | awk '{print "cp " $1 " ../output_splits/1024/test/"}' | parallel
cat t3 | awk '{print "cp " $1 " ../output_splits/1024/val/"}' | parallel
cat t4 | awk '{print "cp " $1 " ../output_splits/1024/train/"}' | parallel

# Now make other sizes
rm -f tmp
for dirname in `ls -1d ../output_splits/* | grep -v 1024`; do
    mkdir -p ${dirname}/test
    mkdir -p ${dirname}/train
    mkdir -p ${dirname}/val
    dimen=`basename ${dirname}`

    for src in `find ../output_splits/1024/ -name "*.png"`; do
        out=`echo ${src} | sed "s|/1024/|/$dimen/|g"`;
        ln="echo \"Resizing ${src}...\"; convert ${src} -resize ${dimen}x${dimen} ${out}"
        echo $ln >> tmp
    done
done

cat tmp | parallel
