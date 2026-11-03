// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "StormBladeGameMode.generated.h"

/**
 *  Simple GameMode for a third person game
 */
UCLASS(abstract)
class AStormBladeGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	
	/** Constructor */
	AStormBladeGameMode();
};



