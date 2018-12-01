#!/usr/local/bin/octave

function combineSpriteSheets2(dirName)

addpath('jsonlab');

data = loadjson(fullfile(dirName,'sprites2.json'));
layers = data.layers;

outputJson = [];
outputJsonPath = fullfile(dirName,'animations.json');
imageSize = [];

for k = 1:length(layers)
  outputImage = [];
  lastImg = [];
  imageCounter = 0;
  layerName = layers{k}.name;
  layerJson = struct();

  fprintf('\n%s\n',layerName);
  animations = layers{k}.animations;

  animationNames = fieldnames(animations);
  animationJson = struct();
  for f = 1:length(animationNames)

    animationData = animations.(animationNames{f});
    files = animationData.frames;
    startImageIndex = imageCounter;


    for n = 1:length(files)
      imagePath = fullfile(dirName, files{n});
      imageFiles = glob(imagePath);

      startFileIndex = 1;
      endFileIndex = length(imageFiles);
      inc = 1;

      if (isfield(animationData, 'reverse'))
        if (animationData.reverse)
          startFileIndex = endFileIndex;
          endFileIndex = 1;
          inc = -1;
        end
      end

      for m = startFileIndex:inc:endFileIndex
        thisImagePath = imageFiles{m};
        [img, map, alpha] = imread(thisImagePath);
        if isempty(imageSize)
          imageSize = [size(img,2), size(img,1)];
        end
        img = cat(3,uint8(img),uint8(alpha));

        if (sum(img(:)) == 0)
          fprintf('warning, frame %d of %s is empty\n', m, animationNames{f});
        end
        outputImage = horzcat(outputImage, img);
        imageCounter = imageCounter + 1;
      end
    end

    endImageIndex = imageCounter - 1;

    animationJson.(animationNames{f}) = struct('frames',[startImageIndex:endImageIndex],'repeat',animationData.repeat,'fps',animationData.fps);
    fprintf('animation %s has frames %s\n',animationNames{f},mat2str(startImageIndex:endImageIndex));
  end


  fileName = fullfile('resources','images',dirName,sprintf('%s.png',layerName));

  layerJson.name = layerName;
  layerJson.spritesheet = struct('filename',fileName,'size', imageSize, 'frames', imageCounter);
  layerJson.animations = animationJson;

  outputJson = [outputJson, {layerJson}];

  %if (sum(outputImage(:)) == 0)
  %  fprintf('Image is empty, skipping')
  %else
    outputFileName = fullfile(dirName,sprintf('%s.png',layerName));
    fprintf('writing to %s\n', outputFileName);
    imwrite(outputImage(:,:,1:3), outputFileName, 'png', 'Alpha', outputImage(:,:,4));
  %end

end

opt = struct();
opt.SingletCell = 1;
str = savejson('layers',outputJson, opt);
fid = fopen(outputJsonPath,'w');
fwrite(fid,str);
fclose(fid);
