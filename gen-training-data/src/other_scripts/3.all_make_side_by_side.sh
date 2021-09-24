rm tmp
rm tmp2
for filename in ../output/*/target.png; do
   dirname=`dirname $filename`
   basename=`basename $filename`
   echo "Processing $dirname"

   # Check if you need to produce a version of the image with levels adjusted
   if test -f "${dirname}/target.fixed.png"; then
       echo "    target.fixed.png exists."
   else
       echo "cd ${dirname}; convert target.png -level 0%,78% target.fixed.png; cd -" >> tmp
   fi

   id=`echo $dirname | sed "s/...output.//g"`

   if test -f "${dirname}/${id}.png"; then
       echo "    ${id}.png exists."
   else
      echo "cd ${dirname}; montage input.png target.fixed.png -tile 2x1 -geometry +0+0 ${id}.png" >> tmp2 
   fi
done


cat tmp | parallel
cat tmp2 | parallel
